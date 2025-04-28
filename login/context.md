# **Implementation Plan: Login/Sign-Up Authentication Page**

## **Overview**
The purpose of this implementation is to build a **Login/Sign-Up page** using **Next.js**, **Supabase** for authentication, and the **Figma UI design** you have. We will ensure the frontend is styled using **TailwindCSS** to match the design, and authentication will be handled by **Supabase**. The steps are outlined below, detailing the order in which each task will be completed.

---

## **Step-by-Step Plan**

### **Step 1: Set up the Next.js Project**
1. **Create a New Next.js Project:**
   - Run the following command to create a new Next.js project.
     ```bash
     npx create-next-app@latest login-signup-page
     ```
   - Change to the project directory:
     ```bash
     cd login-signup-page
     ```

2. **Install Required Dependencies:**
   - Install **Supabase** for authentication and **TailwindCSS** for styling:
     ```bash
     npm install @supabase/supabase-js tailwindcss postcss autoprefixer
     ```

3. **Initialize TailwindCSS:**
   - Generate the TailwindCSS configuration:
     ```bash
     npx tailwindcss init
     ```

4. **Configure TailwindCSS:**
   - Open `tailwind.config.js` and ensure the paths are set to your Next.js files:
     ```js
     module.exports = {
       content: [
         "./pages/**/*.{js,ts,jsx,tsx}",
         "./components/**/*.{js,ts,jsx,tsx}",
       ],
       theme: {
         extend: {},
       },
       plugins: [],
     };
     ```

5. **Configure Global Styles for TailwindCSS:**
   - In `./styles/globals.css`, add the following Tailwind directives:
     ```css
     @tailwind base;
     @tailwind components;
     @tailwind utilities;
     ```

### **Step 2: Set up Supabase for Authentication**
1. **Supabase Configuration:**
   - Ensure that the Supabase keys are added to your `.env.local` file:
     ```dotenv
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

2. **Create Supabase Client:**
   - In the `lib/` folder, create a file named `supabase.js` and initialize the Supabase client:
     ```js
     import { createClient } from '@supabase/supabase-js';

     const supabase = createClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
     );

     export default supabase;
     ```

### **Step 3: Integrate Figma UI into TailwindCSS**
1. **Breakdown the Figma Design:**
   - Open your Figma design and identify key components (inputs, buttons, etc.). Pay attention to the following:
     - **Font sizes**, **colors**, **spacing**, and **layout**.
     - Extract key properties for consistency in styling.

2. **Implement UI Components with TailwindCSS:**
   - Translate the Figma design into **TailwindCSS**-styled components, making sure to follow the structure provided in your Figma design.
   - Example of a login form:
     ```jsx
     // components/AuthForm.js
     import { useState } from 'react';
     import supabase from '../lib/supabase';

     export default function AuthForm() {
       const [email, setEmail] = useState('');
       const [password, setPassword] = useState('');
       const [isLogin, setIsLogin] = useState(true);

       const handleSubmit = async (event) => {
         event.preventDefault();
         if (isLogin) {
           const { user, error } = await supabase.auth.signInWithPassword({
             email,
             password,
           });
           if (error) alert(error.message);
           else alert('Login successful');
         } else {
           const { user, error } = await supabase.auth.signUp({
             email,
             password,
           });
           if (error) alert(error.message);
           else alert('Sign up successful');
         }
       };

       return (
         <form onSubmit={handleSubmit} className="space-y-4">
           <input
             type="email"
             placeholder="Email"
             value={email}
             onChange={(e) => setEmail(e.target.value)}
             className="input-class"
           />
           <input
             type="password"
             placeholder="Password"
             value={password}
             onChange={(e) => setPassword(e.target.value)}
             className="input-class"
           />
           <button type="submit" className="btn-class">
             {isLogin ? 'Login' : 'Sign Up'}
           </button>
           <p
             onClick={() => setIsLogin(!isLogin)}
             className="text-blue-500 cursor-pointer"
           >
             {isLogin ? 'No account? Sign Up' : 'Already have an account? Login'}
           </p>
         </form>
       );
     }
     ```

3. **Adjust Styles Based on Figma:**
   - Use **TailwindCSS classes** to match the design, such as padding, font sizes, borders, and background colors. Make sure the **spacing** and **alignment** are consistent with the Figma design.

### **Step 4: Create the Login/Sign-Up Page**
1. **Create a Login Page:**
   - In `pages/login.js`, import the `AuthForm` component and use it for the login and sign-up functionality:
     ```jsx
     // pages/login.js
     import AuthForm from '../components/AuthForm';

     export default function LoginPage() {
       return (
         <div className="flex justify-center items-center min-h-screen bg-gray-100">
           <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
             <h2 className="text-2xl font-bold text-center mb-4">Login / Sign Up</h2>
             <AuthForm />
           </div>
         </div>
       );
     }
     ```

2. **Handle Routing and Authentication State:**
   - Use **Supabase**'s authentication state to redirect users to the dashboard once they are logged in:
     ```js
     import { useEffect } from 'react';
     import { useRouter } from 'next/router';
     import supabase from '../lib/supabase';

     const router = useRouter();

     useEffect(() => {
       const session = supabase.auth.session();
       if (session) {
         router.push('/dashboard');
       }
     }, []);
     ```

### **Step 5: Final Testing and Deployment**
1. **Test Login and Sign-Up Flows:**
   - Test the **login** and **sign-up** forms to ensure they function correctly.
   - Verify that users can sign up and log in without issues.

2. **Ensure UI Consistency:**
   - Test the UI across different screen sizes to ensure the design from Figma is responsive and accurate.

3. **Deploy the Application:**
   - Once everything is tested, deploy the application to **Vercel** or your preferred hosting provider.

---

## **Conclusion**
This **context.md** provides a clear step-by-step plan for implementing the **Login/Sign-Up page** with **Next.js**, **Supabase** authentication, and **TailwindCSS**, using your **Figma UI design**. Following this plan will ensure that the UI is consistent. 