# MarketOn Project

## 프로젝트 구조
```
marketon/
├── backend/          # Django 백엔드 (Python 3.12)
├── frontend/         # React 프론트엔드 (Ionic + Vite + Capacitor)
└── README.md
```

## 기술 스택
- **백엔드**: Django 5.x + Python 3.12 + PostgreSQL
- **프론트엔드**: React + TypeScript + Ionic + Vite
- **모바일**: Capacitor (Android/iOS)
- **환경**: Windows + PowerShell

## 설치 및 실행

### 백엔드 실행
```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py runserver 0.0.0.0:8000
```

### 프론트엔드 실행
```powershell
cd frontend
npm install
npm run dev
```

## 환경변수 설정

### 백엔드 (.env.dev)
```
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://localhost:5432/marketon_db
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 프론트엔드 (.env)
```
VITE_API_BASE_URL=http://localhost:8000/api/
```

## API Base URL
- 개발 환경: `http://localhost:8000/api/`

## 주의사항
- Windows PowerShell 환경에서 실행
- 프론트엔드 스크립트 연결 시 `&&` 사용 금지
- 백엔드와 프론트엔드는 분리된 디렉토리로 관리
