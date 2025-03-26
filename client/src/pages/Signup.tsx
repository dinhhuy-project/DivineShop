import { PackageIcon } from "lucide-react";
import { Link } from "wouter";
import SignupForm from "@/components/auth/SignupForm";

export default function Signup() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-gray-50 to-gray-100 px-4">
      <div className="mb-8 flex flex-col items-center">
        <div className="h-14 w-14 rounded-xl bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center text-white mb-4 shadow-md">
          <PackageIcon size={28} />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          DivineShop CRM
        </h1>
        <p className="text-sm text-gray-600 mt-1">Create your account</p>
      </div>
      
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8 border border-gray-100">
        <SignupForm />
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
      
      <p className="text-xs text-gray-500 mt-8">
        © {new Date().getFullYear()} DivineShop. All rights reserved.
      </p>
    </div>
  );
}