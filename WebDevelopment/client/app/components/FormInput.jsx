export default function FormInput({ inputValue = "", inputType = "text", inputName = "",required = false }) {
  return (
    <div className="flex flex-col">
      <label htmlFor={inputValue}>{inputName}</label>
      <input className="bg-slate-100 border text-blue-950 border-slate-300 rounded-md px-3 py-2 mt-1 ml-2 mb-4"
        id={inputValue} type={inputType} name={inputValue} required={required}/>
      <br />
    </div>
  );
}