import React from 'react'
import Image from "next/image";
import Link from "next/link";
import Logo from "@/component/Logo";

export default function RegisterPage() {
  return (
      <div className={`flex items-center justify-center font-[Iransans] w-4/5 md:w-2/5 lg:w-1/4 mx-auto`}>

          <div className={`flex flex-col  items-center justify-center w-full `}>
         <Logo />
              <h2 className={`text-[20px] font-semibold font-[iransans] mb-2`}>به بیت باکس خوش آمدید.</h2>
              <p className={`text-[15px] font-light font-[iransans]`}>جهت ورود نام کاربری و رمز عبور را وارد کنید.</p>
              <form action="" className={`flex flex-col gap-4 items-center justify-center mt-6 w-full`}>
                  <input type="text" placeholder={`شماره تلفن`} className={` w-full py-3 px-2 bg-[#454545] rounded-[8px]`}/>
                  <input type="text" placeholder={`نام`} className={` w-full py-3 px-2 bg-[#454545] rounded-[8px]`}/>
                    <button className={` w-full py-3 px-2 bg-[#FFEB3B] hover:bg-[#C7B40B] duration-150 text-black font-semibold cursor-pointer rounded-[8px] mt-5`}>ایجاد حساب</button>
              </form>
              <div className={`flex gap-2 items-center justify-center mt-6 w-full`}>
                  <span className={`text-[#a5a5a5]`}>حساب کاربری دارید؟</span>
                  <Link className={`text-[#FFEB3B]`} href={`/login`} >ورود</Link>
              </div>
          </div>
      </div>
  )
}
