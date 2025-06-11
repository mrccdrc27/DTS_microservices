from django.db.models import Q
from step.models import Steps, StepTransition
from workflow.models import Workflows


def is_transition_initialized(transition):
    """
    A transition is considered initialized if:
      - It has an action assigned, AND
      - At least one of from_step_id or to_step_id is non-null
    """
    result = (
        transition.action_id is not None and
        (transition.from_step_id is not None or transition.to_step_id is not None)
    )
    print(f"Transition {getattr(transition, 'transition_id', transition)} initialized: {result}")
    return result


def is_step_initialized(step):
    print(f"\nChecking step: {step.step_id}")

    if not step.role_id:
        print(f"Step {step.step_id} has no role assigned.")
        return False

    # Gather any transitions where this step is source or target
    transitions = StepTransition.objects.filter(
        Q(from_step_id=step.step_id) | Q(to_step_id=step.step_id)
    )

    if not transitions.exists():
        print(f"Step {step.step_id} has no transitions at all.")
        return False

    # All transitions must be initialized
    for t in transitions:
        if not is_transition_initialized(t):
            print(f"Step {step.step_id} has uninitialized transition {getattr(t, 'transition_id', t)}.")
            return False

    print(f"Step {step.step_id} is fully initialized.")
    return True


def is_workflow_initialized(workflow):
    print(f"\nEvaluating workflow '{workflow.name}' ({workflow.workflow_id})")
    print(f"Category: {workflow.category}, Sub-category: {workflow.sub_category}")

    if not workflow.category or not workflow.sub_category:
        print("Missing category or subcategory.")
        return False

    steps = Steps.objects.filter(workflow_id=workflow.workflow_id)
    if not steps.exists():
        print("No steps found.")
        return False

    # Every step must pass the simple init check
    for step in steps:
        if not is_step_initialized(step):
            print(f"Step {step.step_id} failed initialization check.")
            return False

    print(f"Workflow '{workflow.name}' is initialized.")
    return True


def compute_workflow_status(workflow_id):
    print(f"\n>>> Computing status for workflow_id: {workflow_id}")
    try:
        workflow = Workflows.objects.get(workflow_id=workflow_id)
    except Workflows.DoesNotExist:
        print("Workflow not found.")
        return

    initialized = is_workflow_initialized(workflow)
    new_status = "initialized" if initialized else "draft"
    print(f"Setting workflow '{workflow.name}' status to: {new_status}")
    workflow.status = new_status
    workflow.save(update_fields=["status"])
