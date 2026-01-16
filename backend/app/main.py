from fastapi import FastAPI

app = FastAPI()

@app.get("/basic")
def health():
    return {"status": "ok"}
