import style from './stepcard.module.css'

export function StepCard(props) {
    return (
        <>
        <div className={style.card}>
            <p>
                Step {props.num}: {props.stepName} 
            </p>
        </div>
        </>
    )
}

export default function WorkflowSteps() {
    return(
        <>

        <div className={style.stepcontainer}>
            <h3>Workflow Step</h3>
            <button className={style.button }>
                create step
            </button>
            
            {/* Can do array MAP to dynamically generate cards */}
            <div className={style.cardcontainer}>
            <StepCard num="1" stepName="Initial Assessment" />
            <StepCard num="2" stepName="Data Collection" />
            <StepCard num="3" stepName="Analysis & Review" />
            <StepCard num="4" stepName="Final Decision" />
            <StepCard num="5" stepName="Implementation" />                       
            </div>
        </div>
        </>
    )
}