// style
import general from '../styles/general-table-styles.module.css'

export function SearchBar({ value, onChange }) {
  return (
    <input
      className={general.searchBar}
      type="text"
      name="search-ticket"
      placeholder="Search by ticket ID or keywords..."
      value={value}
      onChange={onChange}
    />
  );
}


export function Dropdown({ name, value, onChange, options = [], placeholder = "Please select an option" }) {
  return (
    <select className={general.dropdown} name={name} value={value} onChange={onChange}>
      <option value="" disabled>{placeholder}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
}


export function Datetime() {
  return(
    <div></div>
  );
}