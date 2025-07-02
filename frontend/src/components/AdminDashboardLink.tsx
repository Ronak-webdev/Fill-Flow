import { useLocation, useNavigate } from "react-router-dom";

const AdminDashboardLink = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === "/admin") {
      window.location.href = "/admin";
    } else {
      navigate("/admin");
      setTimeout(() => {
        window.location.href = "/admin";
      }, 0);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="px-4 py-2 rounded bg-zinc-800 text-white hover:bg-zinc-700 transition-colors duration-200 font-semibold shadow"
    >
      Go to Admin Dashboard
    </button>
  );
};

export default AdminDashboardLink;
