import React, { useState } from "react";
import {auth, provider, db} from '../firebase';
import {createUserWithEmailAndPassword, signInWithPopup, signInWithEmailAndPassword} from 'firebase/auth';
import {useNavigate} from 'react-router-dom';
import './login.css'
import {doc, setDoc} from 'firebase/firestore';
import upload from "../lib/uploadPfp";


//export class Login extends Component {
  //render() {
function Login({ setIsAuth }){
    const [avatar,setAvatar] = useState({
        file:null,
        url:""
    })

    const [loading, setLoading] = useState(false)


    const handleAvatar = e =>{
        if(e.target.files[0]){
            setAvatar({
                file:e.target.files[0],
                url:URL.createObjectURL(e.target.files[0])
            })
        }
    }

    const handleRegister = async (e) => {
        setLoading(true)
        e.preventDefault()
        const formData = new FormData(e.target)

        const {username,email,password} = Object.fromEntries(formData);

        try{
            const res = await createUserWithEmailAndPassword(auth,email,password)

            const imgUrl = await upload(avatar.file)

            await setDoc(doc(db,"users",res.user.uid), {
                username,
                email,
                avatar: imgUrl,
                id: res.user.uid,
                blocked: [],
            })

            await setDoc(doc(db,"userchats",res.user.uid), {
                chats: [],
            })

            console.log("Works")
        
        }catch(err){
            console.log(err)
        } finally {
            setLoading(false)
        }
    }

    const handleLogin = async (e) =>{
        e.preventDefault()
        setLoading(true)
        
        const formData = new FormData(e.target)
        const {email,password} = Object.fromEntries(formData);

        
        try{
            await signInWithEmailAndPassword(auth,email,password)
        }catch(err) {
            console.log(err)
        } finally{
            setLoading(false)
        }
    }


    let navigate = useNavigate();

    const signInWithGoogle = () =>{
        signInWithPopup(auth, provider).then((result) =>{
            localStorage.setItem("isAuth", true);
            setIsAuth(true);
            navigate("/")
        })
    }
    return (
        <div className="signInContainer">
            <div className="loginPage">
            <div className="item">
                <h2>Welcome back,</h2>
                <form onSubmit={handleLogin}>
                    <input type="text" placeholder="Email" name="email"/>
                    <input type="password" placeholder="Password" name="password" />
                    <button disabled={loading}>{loading ? "Loading" : "Sign In"}</button>
                </form>
                <h2>OR</h2>
                <button className="login-with-google-btn" onClick={signInWithGoogle}>Sign in with Google</button>
            </div>
            <div className="seperator"></div>
            <div className="item">
                <h2>Create an Account</h2>
                <form onSubmit={handleRegister}> 
                    <label htmlFor="file">
                        <img src={avatar.url || "./avatar.png"} alt="" />
                        Upload an Image</label>
                    <input type="file" id="file" style={{display:"none"}} onChange={handleAvatar}/>
                    <input type="text" placeholder="Username" name="username"/>
                    <input type="text" placeholder="Email" name="email"/>
                    <input type="password" placeholder="Password" name="password"/>
                    <button disabled={loading}>{loading ? "Loading" : "Sign Up"}</button>
                </form>
            </div>
            </div>
        </div>
    )
}
//}
//}

export default Login