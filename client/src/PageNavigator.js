
import { useNavigate } from "react-router-dom";

export default function navigateTo(url){
    let navigate = useNavigate();
    navigate(url);
}
