import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Index from "@/pages/Index";

export default function RootRedirect() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is already logged in
    const role = localStorage.getItem("dps_role");
    
    if (!role) {
      // If not logged in, redirect to auth page
      navigate("/auth");
    }
    // If logged in, stay on the dashboard and render Index component 
  }, [navigate]);
  
  // Return the Index component to show dashboard content
  return <Index />;
}