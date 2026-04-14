import os
import uuid
import json
import requests
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from faster_whisper import WhisperModel
import tempfile
import time
import traceback

app = FastAPI()

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Lazy Initialize Whisper Model
whisper_model = None
model_size = "tiny.en" 

def get_whisper_model():
    global whisper_model
    if whisper_model is None:
        try:
            print("Loading Whisper model (CPU Mode)...")
            whisper_model = WhisperModel(model_size, device="cpu", compute_type="int8")
            print("Whisper model loaded successfully.")
        except Exception as e:
            print(f"Whisper init failed: {e}")
            whisper_model = None
    return whisper_model

# OLLAMA CONFIG
OLLAMA_URL = "http://localhost:11434/api/generate"

# Background Initialization
import threading
def background_model_load():
    get_whisper_model()

threading.Thread(target=background_model_load, daemon=True).start()


@app.post("/interview")
async def interview_pipeline(
    audio: UploadFile = File(...), 
    difficulty: str = Form("Moderate"),
    company_type: str = Form("Standard")
):
    """
    1. Receive audio
    2. Transcribe (Whisper)
    3. Evaluate (Ollama) with difficulty adjustment
    4. Generate Speech (TTS)
    5. Return Results
    """
    session_id = str(uuid.uuid4())
    temp_audio_path = f"temp_{session_id}.webm"
    output_audio_path = f"response_{session_id}.mp3"

    try:
        # Save received audio
        with open(temp_audio_path, "wb") as f:
            f.write(await audio.read())

        print(f"--- [BACKEND DEBUG] ---")
        print(f"Audio File: {temp_audio_path}")
        print(f"File Size: {os.path.getsize(temp_audio_path)} bytes")
        
        # Transcription logic
        try:
            model = get_whisper_model()
            print("Transcribing with Whisper...")
            segments, info = model.transcribe(temp_audio_path, beam_size=5)
            transcription = " ".join([segment.text for segment in segments])
        except Exception as te:
            print(f"Transcription FAILED: {te}")
            return JSONResponse(status_code=500, content={"error": "Transcription failed. Try a shorter answer."})
        
        print(f"Transcription Result: '{transcription}'")
        print(f"-----------------------")
        
        if not transcription.strip():
            transcription = "[Silence]"

        # LLM Logic with Difficulty Scaling
        difficulty_instruction = {
            "Easy": "Ask basic, entry-level questions. Be encouraging in feedback.",
            "Moderate": "Ask standard technical and behavioral questions.",
            "Hard": "Ask deep, complex technical questions. Be a critical and rigorous interviewer (Zoho/Product style)."
        }.get(difficulty, "Ask standard questions.")

        prompt = f"""You are a professional technical interviewer of {company_type} standards. 
Candidate Answer: "{transcription}"

Task:
1. CRITIQUE the candidate's answer technically. Acknowledge their specific points (e.g. if they mention DSA, evaluate their understanding).
2. Rate their confidence and accuracy.
3. Ask 1 follow-up or new technical question based on their level.

Constraints:
- Be precise and professional.
- Use between 40-60 words (balanced for speed and depth).
- Do NOT skip the candidate's points.

Format ONLY:
Score: X/10
Feedback: <Detailed technical critique of the answer>
Next Question: <Related technical question>"""

        ollama_payload = {
            "model": "phi3",
            "prompt": prompt,
            "stream": False
        }

        try:
            print("Sending prompt to Ollama (AI)...")
            response = requests.post(OLLAMA_URL, json=ollama_payload, timeout=90)
            ai_text = response.json().get("response", "Score: 0/10\nFeedback: Error contacting AI.\nNext Question: Can you repeat that?")
            print("Ollama responded successfully.")
        except Exception as e:
            print(f"Ollama Error: {e}")
            ai_text = f"Score: 0/10\nFeedback: AI offline. {str(e)}\nNext Question: Please check if Ollama is running."

        # Parse AI Response
        lines = ai_text.strip().split('\n')
        score = "N/A"
        feedback = "N/A"
        next_question = "Tell me more about yourself."

        for line in lines:
            if line.startswith("Score:"): score = line.replace("Score:", "").strip()
            elif line.startswith("Feedback:"): feedback = line.replace("Feedback:", "").strip()
            elif line.startswith("Next Question:"): next_question = line.replace("Next Question:", "").strip()

        # TTS shifted to Frontend

        # Basic confidence detection (filler words)
        fillers = ["um", "uh", "ah", "like", "you know"]
        filler_count = sum(transcription.lower().count(f) for f in fillers)
        confidence_msg = "Confident" if filler_count < 3 else "Needs practice (many fillers)"

        return {
            "transcription": transcription,
            "score": score,
            "feedback": feedback,
            "next_question": next_question,
            "confidence": confidence_msg
        }

    except Exception as e:
        print("CRITICAL BACKEND ERROR:")
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})
    finally:
        # Cleanup temp files
        if os.path.exists(temp_audio_path): 
            try: os.remove(temp_audio_path)
            except: pass

@app.get("/status")
async def status():
    """
    Checks the health of sub-components.
    """
    ollama_ok = False
    try:
        r = requests.get("http://localhost:11434/api/tags", timeout=2)
        if r.status_code == 200:
            ollama_ok = True
    except:
        pass
        
    return {
        "status": "online",
        "ollama": "ok" if ollama_ok else "unreachable",
        "whisper": "ready" if whisper_model else "lazy_loading",
        "tts": "initialized"
    }

@app.get("/welcome")
async def welcome():
    """
    Returns initial greeting text.
    """
    greeting = "Hi hello! I am PlaceRight AI, your companion for this mock interview. Ready to start?"
    return {
        "text": greeting
    }

@app.get("/audio/{filename}")
async def get_audio(filename: str):
    return FileResponse(filename, media_type="audio/mpeg")

@app.get("/health")
async def health():
    return {"status": "running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
