# Python Backend API

This is a FastAPI backend for the Smartpix frontend project.
# come into virtual enviroment 
.venv\Scripts\activate     
# run the app
uvicorn app:app 
http://127.0.0.1:8000/docs#/

creat your own SECRET_KEY
python -c "import secrets; print(secrets.token_hex(32))"