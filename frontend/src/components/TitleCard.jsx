import style from './TitleCard.module.css'

export default function TitleCard(props) {
    return(
        <>
        <div>
            <p className={style.name}>Admin / {props.name}</p>
            <h1>{props.title}</h1>
        </div>
        </>
    )
}