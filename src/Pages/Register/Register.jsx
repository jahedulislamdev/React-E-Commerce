import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { contextProvider } from '../../Components/Provider/DataProvider';
import { Slide, toast, ToastContainer } from 'react-toastify';
import { updateProfile } from 'firebase/auth';
import Swal from 'sweetalert2';

const Register = () => {
   const { registerUser, sendVerificationEmail, setLoading, setUser } = useContext(contextProvider);
   const [err, setErr] = useState(null);
   const handleFormSubmit = (e) => {
      setLoading(true);
      setErr(null);
      e.preventDefault();
      const userData = new FormData(e.currentTarget);
      const number = userData.get("number");
      const userName = userData.get("name");
      const email = userData.get("email");
      const password = userData.get("password");
      const terms = userData.get("terms")
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{6,}$/;

      if (!number || number.length !== 11 || isNaN(number) || !number.startsWith("01")) {
         setLoading(false);
         return setErr("Please enter a valid 11-digit phone number starting with 01.");
      } else if (!passwordRegex.test(password)) {
         setLoading(false);
         return setErr("Password must be at least 6 characters with at least one uppercase and one lowercase letter.");
      } else if (!terms) {
         setLoading(false);
         return setErr("Plese Accept our Terms and Conditions!")
      }
      registerUser(email, password)
         .then((res) => {
            updateProfile(res.user, { displayName: userName })
               .then(() => sendVerificationEmail()) // send varification email
               .then(() => {
                  Swal.fire({
                     text: "We send a varification link to your email.Please varify before login.",
                     icon: "success",
                     confirmButtonText: "GOT IT!",
                     confirmButtonColor: "#2c2c54",
                  });
                  e.target.reset(); // reset form after registration
                  // Don't set user in context immediately after registration.
                  // User should login after verifying their email.
                  setUser(null)
                  // console.log(res.user)
               })
         })
         .catch((err) => {
            if (err.code === 'auth/email-already-in-use') {
               toast.error("Email Already In Use."), { autoClose: 2000, }
            } else {
               toast.error("Registration Faild! Please Try Again."), { autoClose: 2000 }
               // console.log(err)
            }
         })
         .finally(() => setLoading(false));
   }
   return (
      <div className='w-11/12 sm:w-1/2 md:w-2/4 xl:w-1/3 mx-auto border font-display border-[#354c74] shadow-md my-3 md:py-4 rounded-lg'>
         <form onSubmit={handleFormSubmit} className="card-body space-y-2">
            <p className='px-2 text-violet-300 text-2xl font-semibold'>Registration</p>
            <div className="form-control">
               <input name='number' type="number" placeholder="018XXXXXXXX" className="input focus:outline-0 w-full" required />
            </div>
            <div className="form-control">
               <input name='name' type="text" placeholder="Username" className="input focus:outline-0 w-full" required />
            </div>
            <div className="form-control">
               <input name='email' type="email" placeholder="example@email.com" className="input focus:outline-0 w-full" required />
            </div>
            <div className="form-control">
               <input name='password' type="password" placeholder="password" className="input focus:outline-0 w-full" required />
               {err && <p className='m-1 text-xs text-red-600'>{err}</p>}
            </div>
            <div className="form-control">
               <label className="cursor-pointer justify-start label">
                  <input name='terms' type="checkbox" className="checkbox checkbox-xs rounded-box checkbox-primary" />
                  <span className="label-text text-xs">Accept our <Link to={''} className='text-violet-300'>Terms and Conditions</Link></span>
               </label>
            </div>
            <div className="form-control">
               <button className="btn bg-purple-700 w-full">Register</button>
               <p className='text-sm font-light mt-2 ps-1'>Don&apos;t have an Account? <Link to={"/login"} className='font-medium text-violet-300'>Login</Link></p>
            </div>
         </form>
         <ToastContainer transition={Slide} />
      </div>
   );
};

export default Register;