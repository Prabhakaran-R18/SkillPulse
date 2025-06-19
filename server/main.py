# ...existing code...
from fastapi import FastAPI, File, UploadFile
from pdfminer.high_level import extract_text
import io

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Backend is active"}

@app.post("/upload-resume/")
async def upload_resume(file: UploadFile = File(...)):
    contents = await file.read()
    file_stream = io.BytesIO(contents)
    text = extract_text(file_stream)
    return {"extracted_text": text[:500]}
# ...existing code...