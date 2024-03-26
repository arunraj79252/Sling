import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom"
import Header from "../components/layout/header"
import { refreshTokenSelector } from "../store/selectors/AuthSelectors"

const AuthProtected = () => {
    const selector = useSelector(refreshTokenSelector)
  let token = selector
  if (token) {
    return <Header/>
  }
  return <Navigate to={"/login"} replace/>
}
export {AuthProtected}