import logging
from typing import Dict, Any, Optional, List
from django.db import transaction
from django.core.exceptions import ValidationError
from django.utils import timezone

from ..models import Category, Workflows
from step.models import Steps, StepTransition
from action.models import Actions
from role.models import Roles

from ..serializers import (
CategorySerializer, RoleSerializer, ActionSerializer,
WorkflowAggregatedSerializer, StepSerializer, StepTransitionSerializer
)

logger = logging.getLogger(__name__)


class WorkflowCommitService:
    """
    Service to commit workflow JSON data to the database.
    Handles creation and updates of all related models in a single transaction.
    """

    def __init__(self):
        self.created_objects = {key: [] for key in ['categories', 'roles', 'actions', 'workflows', 'steps', 'transitions']}
        self.updated_objects = {key: [] for key in ['categories', 'roles', 'actions', 'workflows', 'steps', 'transitions']}

    @transaction.atomic
    def commit_workflow_data(self, workflow_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main method to commit workflow data to the database.
        """
        try:
            workflow_info = workflow_data.get('workflow', {})
            self._validate_required_fields(workflow_info)

            self._process_categories(workflow_info)
            self._process_roles(workflow_info)
            self._process_actions(workflow_info)
            workflow_obj = self._process_workflow(workflow_info)
            self._process_steps(workflow_info, workflow_obj)
            self._process_transitions(workflow_info)

            # Placeholder for any post-commit hook (e.g., notify, audit, etc.)
            self._post_commit_hook(workflow_obj)

            return self._generate_commit_report()

        except ValidationError as ve:
            logger.error(f"ValidationError during workflow commit: {ve}")
            raise
        except Exception as e:
            logger.exception("Unexpected error during workflow commit.")
            raise ValidationError(f"Failed to commit workflow data: {str(e)}")

    def _validate_required_fields(self, workflow_data: Dict[str, Any]) -> None:
        """Ensure required fields are present in workflow_data"""
        required = ['name', 'status']
        missing = [field for field in required if not workflow_data.get(field)]
        if missing:
            raise ValidationError(f"Missing required fields in workflow: {missing}")
    

    def _post_commit_hook(self, workflow: Workflows) -> None:
        """Optional post-commit hook for notifications, audit logs, etc."""
        logger.info(f"Workflow {workflow.workflow_id} committed successfully.")

    def _create_or_update_category(self, category_data: Dict[str, Any]) -> Category:
        category_id = category_data.get('category_id')

        if category_id:
            category, created = Category.objects.get_or_create(
                category_id=category_id,
                defaults={
                    'name': category_data.get('name', ''),
                    'parent_id': category_data.get('parent')
                }
            )
            if not created:
                category.name = category_data.get('name', category.name)
                if 'parent' in category_data:
                    category.parent_id = category_data.get('parent')
                category.full_clean()
                category.save()
                self.updated_objects['categories'].append(category)
            else:
                self.created_objects['categories'].append(category)
        else:
            category = Category(
                name=category_data.get('name', ''),
                parent_id=category_data.get('parent')
            )
            category.full_clean()
            category.save()
            self.created_objects['categories'].append(category)

        return category

    def _process_categories(self, workflow_data: Dict[str, Any]) -> None:
        if workflow_data.get('category'):
            self._create_or_update_category(workflow_data['category'])
        if workflow_data.get('sub_category'):
            self._create_or_update_category(workflow_data['sub_category'])

    def _process_roles(self, workflow_data: Dict[str, Any]) -> None:
        """Process and cache roles"""
        self.role_lookup = {}
        roles_data = workflow_data.get('roles', [])
        
        for role_data in roles_data:
            role_id = role_data.get('role_id')
            if not role_id:
                continue

            role, created = Roles.objects.get_or_create(
                role_id=role_id,
                defaults={
                    'name': role_data.get('name', ''),
                    'description': role_data.get('description', ''),
                    'user_id': workflow_data.get('user_id', 1)
                }
            )

            if not created:
                role.name = role_data.get('name', role.name)
                role.description = role_data.get('description', role.description)
                role.save()
                self.updated_objects['roles'].append(role)
            else:
                self.created_objects['roles'].append(role)

            self.role_lookup[role_id] = role


    def _process_actions(self, workflow_data: Dict[str, Any]) -> None:
        for action_data in workflow_data.get('actions', []):
            action_id = action_data.get('action_id')
            action_defaults = {
                'name': action_data.get('name', ''),
                'description': action_data.get('description', '')
            }

            action, created = Actions.objects.get_or_create(action_id=action_id, defaults=action_defaults)
            if not created:
                for field, value in action_defaults.items():
                    setattr(action, field, value)
                action.full_clean()
                action.save()
                self.updated_objects['actions'].append(action)
            else:
                self.created_objects['actions'].append(action)

    def _process_workflow(self, workflow_data: Dict[str, Any]) -> Workflows:
        workflow_id = workflow_data.get('workflow_id')
        category_id = workflow_data.get('category', {}).get('category_id')
        sub_category_id = workflow_data.get('sub_category', {}).get('category_id')

        workflow_defaults = {
            'user_id': workflow_data.get('user_id', 1),
            'name': workflow_data.get('name'),
            'description': workflow_data.get('description', ''),
            'status': workflow_data.get('status'),
            'category_id': category_id,
            'sub_category_id': sub_category_id,
        }

        if workflow_id:
            workflow, created = Workflows.objects.get_or_create(
                workflow_id=workflow_id,
                defaults=workflow_defaults
            )
            if not created:
                for field, value in workflow_defaults.items():
                    setattr(workflow, field, value)
                workflow.full_clean()
                workflow.save()
                self.updated_objects['workflows'].append(workflow)
            else:
                self.created_objects['workflows'].append(workflow)
        else:
            workflow = Workflows(**workflow_defaults)
            workflow.full_clean()
            workflow.save()
            self.created_objects['workflows'].append(workflow)

        return workflow

    def _process_steps(self, workflow_data: Dict[str, Any], workflow: Workflows) -> None:
        steps_data = workflow_data.get('steps', [])
        
        for step_data in steps_data:
            step_id = step_data.get('step_id')

            # ✅ Fetch the role instance using the provided role_id
            try:
                role = Roles.objects.get(role_id=step_data['role_id'])
            except Roles.DoesNotExist:
                raise ValidationError(f"Role with ID '{step_data['role_id']}' does not exist.")

            step_defaults = {
                'workflow_id': workflow,  # ✅ Use model instance
                'role_id': role,          # ✅ Use model instance
                'name': step_data.get('name', ''),
                'description': step_data.get('description', ''),
                'order': step_data.get('order', 0),
                # 'is_initialized': step_data.get('is_initialized', False)
            }

            if step_id:
                step, created = Steps.objects.get_or_create(
                    step_id=step_id,
                    defaults=step_defaults
                )
                
                if not created:
                    for field, value in step_defaults.items():
                        if field not in ['workflow_id', 'role_id']:
                            setattr(step, field, value)
                    step.save()
                    self.updated_objects['steps'].append(step)
                else:
                    self.created_objects['steps'].append(step)




    def _process_transitions(self, workflow_data: Dict[str, Any]) -> None:
        for trans_data in workflow_data.get('transitions', []):
            trans_id = trans_data.get('transition_id')

            try:
                from_step = Steps.objects.get(step_id=trans_data['from_step_id'])
            except Steps.DoesNotExist:
                raise ValidationError(f"Transition refers to non-existent from_step_id: {trans_data['from_step_id']}")

            to_step = None
            if trans_data.get('to_step_id'):
                try:
                    to_step = Steps.objects.get(step_id=trans_data['to_step_id'])
                except Steps.DoesNotExist:
                    raise ValidationError(f"Transition refers to non-existent to_step_id: {trans_data['to_step_id']}")

            try:
                action = Actions.objects.get(action_id=trans_data['action_id'])
            except Actions.DoesNotExist:
                raise ValidationError(f"Transition refers to non-existent action_id: {trans_data['action_id']}")

            trans_defaults = {
                'from_step_id': from_step,
                'to_step_id': to_step,
                'action_id': action
            }

            transition, created = StepTransition.objects.get_or_create(
                transition_id=trans_id,
                defaults=trans_defaults
            )
            if not created:
                for field, value in trans_defaults.items():
                    setattr(transition, field, value)
                transition.full_clean()
                transition.save()
                self.updated_objects['transitions'].append(transition)
            else:
                self.created_objects['transitions'].append(transition)
    def _generate_commit_report(self) -> Dict[str, Any]:
        return {
            'success': True,
            'message': 'Workflow data committed successfully',
            'statistics': {
                'created': {k: len(v) for k, v in self.created_objects.items()},
                'updated': {k: len(v) for k, v in self.updated_objects.items()}
            },
            'created_objects': self.created_objects,
            'updated_objects': self.updated_objects
        }

    def _generate_commit_report(self) -> Dict[str, Any]:
        def serialize(model_list, serializer):
            return serializer(model_list, many=True).data

        return {
            'success': True,
            'message': 'Workflow data committed successfully',
            'statistics': {
                'created': {k: len(v) for k, v in self.created_objects.items()},
                'updated': {k: len(v) for k, v in self.updated_objects.items()}
            },
            'created_objects': {
                'categories': serialize(self.created_objects['categories'], CategorySerializer),
                'roles': serialize(self.created_objects['roles'], RoleSerializer),
                'actions': serialize(self.created_objects['actions'], ActionSerializer),
                'workflows': serialize(self.created_objects['workflows'], WorkflowAggregatedSerializer),
                'steps': serialize(self.created_objects['steps'], StepSerializer),
                'transitions': serialize(self.created_objects['transitions'], StepTransitionSerializer),
            },
            'updated_objects': {
                'categories': serialize(self.updated_objects['categories'], CategorySerializer),
                'roles': serialize(self.updated_objects['roles'], RoleSerializer),
                'actions': serialize(self.updated_objects['actions'], ActionSerializer),
                'workflows': serialize(self.updated_objects['workflows'], WorkflowAggregatedSerializer),
                'steps': serialize(self.updated_objects['steps'], StepSerializer),
                'transitions': serialize(self.updated_objects['transitions'], StepTransitionSerializer),
            }
        }



def commit_workflow_json(workflow_json_data: Dict[str, Any]) -> Dict[str, Any]:
    service = WorkflowCommitService()
    return service.commit_workflow_data(workflow_json_data)
