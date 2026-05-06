import { FaSearch } from "react-icons/fa";

export default function Searchbar({ searchTerm, setSearchTerm, placeholder = "Search..." }) {
    return (
        <div className="relative mb-4">
            <input
                type="text"
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-2 border rounded w-full"
            />
            <FaSearch className="absolute right-3 top-3 text-bg-accent" />
        </div>
    );
}