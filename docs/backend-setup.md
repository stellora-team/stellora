# Запуск backend в Rider

1. Установи .NET 10 SDK. В новом терминале проверь `dotnet --list-sdks`: нужна версия `10.0.xxx`.
2. В клонированном репозитории создай ветку: `git switch -c feature/backend-dotnet-setup`.
3. Замени старую папку `backend` новой из архива. Скопируй в корень `Stellora.slnx`, `global.json`, `.gitignore`, `README.md`, а также этот файл в `docs`. Папку `.git` сохрани.
4. В Rider выбери Open и открой `Stellora.slnx`. Если формат не поддерживается, открой `backend/Stellora.Api/Stellora.Api.csproj`.
5. Из корня выполни `dotnet restore Stellora.slnx`, затем `dotnet build Stellora.slnx`.
6. Запусти `dotnet run --project backend/Stellora.Api --launch-profile http`.
7. Открой http://localhost:5080/api/health. Ожидается JSON с `status: "ok"`.

## Что за файлы

- `Program.cs`: создаёт приложение, регистрирует контроллеры, обработку ошибок и CORS, затем запускает сервер.
- `Controllers/HealthController.cs`: принимает GET-запрос по `/api/health` и возвращает 200 с JSON.
- `Stellora.Api.csproj`: задаёт тип проекта, .NET 10 и настройки компиляции.
- `appsettings.json`: общие настройки без паролей.
- `appsettings.Development.json`: разрешает запросы с локального frontend.
- `Properties/launchSettings.json`: задаёт профиль локального запуска и порт 5080.
- `Stellora.Api.http`: готовый запрос, который можно выполнить в Rider.
- `global.json`: выбирает стабильный SDK .NET 10; разрешает установленные более новые feature bands той же основной версии.

## Если что-то не работает

- `dotnet` не найден: установи SDK и перезапусти терминал/Rider.
- `NETSDK1045` или ошибка SDK: проверь, что установлен .NET 10 SDK и Rider использует его.
- На `/` ошибка 404: это нормально, открывай `/api/health`.
- Порт занят: останови другой процесс или запусти с `--urls http://localhost:5081` и используй новый порт.
- Frontend не запускается: выполни `npm ci` именно в `frontend`.
- Запрос из браузера блокируется CORS: frontend должен быть на `http://localhost:5173`; изменение порта требует обновления AllowedOrigins.

## Следующий этап: US-01

Пока нет БД, миграций, регистрации, авторизации и Swagger UI. PostgreSQL и EF Core — предложенный следующий шаг.
Договоримся, что идентификатор аккаунта — email, определим его нормализацию и закрепим уникальность в БД.
Проверим обычную регистрацию, повтор с тем же email и одновременные запросы: в БД должна оставаться одна запись.
Пароли будем хранить только в виде защищённых хешей.

## Проверка этой заготовки

Структура архива, JSON/XML и сохранность frontend проверены автоматически.
Сборка и HTTP-запуск в среде подготовки не выполнялись: .NET SDK отсутствует.
Выполни команды выше локально перед коммитом.
