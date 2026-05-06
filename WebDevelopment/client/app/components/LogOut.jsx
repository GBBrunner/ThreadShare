export default function LogOut({ className = '', ...props }) {
    async function handleSignOut() {
        // Clear the signed-in user from localStorage to log out
        localStorage.removeItem('auth_token');
        localStorage.removeItem('signed_in_user');
        window.location.href = '/login'; // Redirect to login page after logout
    }
    return (
        <button className='px-6 py-3 w-full text-lg rounded-xl font-bold bg-accent-dark text-white hover:bg-secondary transition-colors' onClick={handleSignOut} {...props}>
            Log Out
        </button>
    );
}