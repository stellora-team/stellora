import React from 'react';

export default function RegisterCard() {
  return (
    <div>
      <div>
        <h3>Створи свій акаунт</h3>
        <h2>Почни свою подорож серед зірок ✦</h2>
      </div>
      <div>
        <form className='flex flex-col w-full'>
          <input type="text" className='w-full'/>
          <input type="email" className='w-full'/>
          <input type="password" className='w-full' />
        </form>
        <div>
          <input type="checkbox" />
          <p>
            Я погоджуюсь з Умовами користування та Політикою конфіденційності
          </p>
        </div>
      </div>

      <div>
        <button>Зареєструватися</button>
        <div>
          <img src="" />
          <button>Продовжити з Google</button>
          <p>
            Вже маєш акаунт? <span>Увійти</span>
          </p>
        </div>
      </div>
    </div>
  );
}
