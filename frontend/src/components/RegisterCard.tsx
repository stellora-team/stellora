import googleIcon from '../assets/icons/google.svg';
import logoIcon from '../assets/icons/logo.svg';
import messageIcon from '../assets/icons/message.svg';
import userIcon from '../assets/icons/user.svg';
import lockIcon from '../assets/icons/lock.svg';
export default function RegisterCard() {
  return (
    <div className="relative overflow-hidden w-full max-w-[440px] p-8 rounded-[24px] bg-[#0c0a1d]/80 border border-[#7454C5]/40 text-[#FFFFFF] shadow-2xl backdrop-blur-md">
      
      <img 
        src={logoIcon} 
        alt="logo" 
        className="absolute -top-1 right-2 w-36 pointer-events-none select-none" 
      />

      
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2">Створи свій акаунт</h3>
        <p className="text-sm text-[rgba(234,229,255,0.7)]">
  Почни свою подорож серед зірок ✦
</p>
      </div>

      <form className="flex flex-col w-full gap-4">
        <div className='relative'>
          <img src={userIcon} alt="user" className="w-5 h-5 select-none absolute left-4 top-4  " />

          <input
            type="text"
            className="w-full  bg-[#1b1736]/90 border border-[#443869] rounded-xl py-3 px-12 text-[#EAE5FF] placeholder:text-[#EAE5FF]/50 focus:outline-none focus:border-[#A749EE] transition-colors"
            placeholder="Ім’я"
          />
        </div>

        <div className='relative'><div/>
          <img
            src={messageIcon}
            alt="message"
            className="w-5 h-5 select-none absolute left-4 top-4"
          />

          <input
            type="email"
            className="w-full bg-[#1b1736]/90 border border-[#443869] rounded-xl py-3 px-12 text-[#EAE5FF] placeholder:text-[#EAE5FF]/50 focus:outline-none focus:border-[#A749EE] transition-colors"
            placeholder="Email"
          />
        </div>
       <div className='relative'>
          <img src={lockIcon} alt="lock" className="w-5 h-5 select-none absolute left-4 top-4" />

          <input
            type="password"
            className="w-full bg-[#1b1736]/90 border border-[#443869] rounded-xl py-3 px-12 text-[#EAE5FF] placeholder:text-[#EAE5FF]/50 focus:outline-none focus:border-[#A749EE] transition-colors"
            placeholder="Пароль"
          />
        </div>

        <label className="cursor-pointer select-none flex gap-3 items-start mt-2">
          <input
            type="checkbox"
            className=" cursor-pointer accent-[#A749EE] mt-1 w-[18px] h-[18px] accent-[#A749EE] rounded border-[#443869] cursor-pointer"
          />
          <p className="text-[13px] leading-relaxed text-[#EAE5FF]/70 leading-relaxed cursor-pointer select-none">
            Я погоджуюсь з Умовами користування та Політикою конфіденційності
          </p>
        </label>

        <button className="w-full mt-4 py-3.5 rounded-full font-bold bg-gradient-to-r from-[#7b32d9] to-[#b240e5] hover:opacity-90 transition-opacity">
          Зареєструватися
        </button>
      </form>

      <div className="text-center my-4 text-xs text-[#EAE5FF]/50 font-medium">
        або
      </div>

      <div className="flex flex-col gap-6">
        <button className="flex items-center justify-center gap-3 w-full py-3.5 rounded-full border border-[#7454C5]/40 hover:bg-white/5 transition-colors">
          <img src={googleIcon} alt="Google" className="w-5 h-5 select-none" />{' '}
          <span className="text-sm font-medium">Продовжити з Google</span>
        </button>

        <p className="text-center text-xs text-[#EAE5FF]/60 ">
          Вже маєш акаунт?{' '}
          <span className="text-[#A749EE]  font-semibold cursor-pointer hover:underline ml-1">
            Увійти
          </span>
        </p>
      </div>
    </div>
  );
}
