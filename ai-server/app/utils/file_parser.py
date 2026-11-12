import io
from fastapi import HTTPException
from pypdf import PdfReader
from docx import Document
import re
from bs4 import BeautifulSoup

def extract_text_from_bytes(file_content: bytes, filename: str) -> str:
    """
    파일의 바이너리 데이터(bytes)와 파일명(str)을 받아
    순수한 텍스트 문자열로 변환합니다.
    (S3 URL 다운로드 데이터 처리에 최적화)
    """
    filename = filename.lower()
    text = ""

    try:
        # 1. PDF 처리
        if filename.endswith('.pdf'):
            pdf_file = io.BytesIO(file_content)
            reader = PdfReader(pdf_file)
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"

        # 2. Word (DOCX) 처리
        elif filename.endswith('.docx'):
            docx_file = io.BytesIO(file_content)
            doc = Document(docx_file)
            for para in doc.paragraphs:
                text += para.text + "\n"

        # 3. 텍스트 파일 처리
        elif filename.endswith(('.txt', '.md')):
            text = file_content.decode('utf-8')

        else:
            raise HTTPException(status_code=400, detail="지원하지 않는 파일 형식입니다. (PDF, DOCX, TXT만 가능)")

    except Exception as e:
        print(f"❌ 파일 파싱 에러: {e}")
        raise HTTPException(status_code=500, detail="파일 내용을 읽는 중 오류가 발생했습니다.")

    # 4. 빈 파일 체크
    if not text.strip():
        raise HTTPException(
            status_code=400, 
            detail="파일에서 텍스트를 추출할 수 없습니다. 스캔본이나 이미지 PDF가 아닌, 텍스트 선택이 가능한 파일을 업로드해 주세요."
        )

    # 5. 토큰 제한 고려 (약 15,000자 제한)
    return text[:15000]

import io
import re
from fastapi import HTTPException
from pypdf import PdfReader
from docx import Document
from bs4 import BeautifulSoup


def extract_text_from_bytes(file_content: bytes, filename: str) -> str:
    """
    파일의 바이너리 데이터(bytes)와 파일명(str)을 받아
    순수한 텍스트 문자열로 변환합니다.
    (주의: 여기서 길이를 자르지 않고 원문 전체를 리턴합니다)
    """
    filename = filename.lower()
    text_parts = []

    try:
        # 1. PDF 처리
        if filename.endswith('.pdf'):
            pdf_file = io.BytesIO(file_content)
            reader = PdfReader(pdf_file)
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text_parts.append(extracted)

        # 2. Word (DOCX) 처리
        elif filename.endswith('.docx'):
            docx_file = io.BytesIO(file_content)
            doc = Document(docx_file)
            for para in doc.paragraphs:
                text_parts.append(para.text)

        # 3. 텍스트 파일 처리
        elif filename.endswith(('.txt', '.md')):
            # decode error 방지 (replace)
            text_parts.append(file_content.decode('utf-8', errors='replace'))

        else:
            raise HTTPException(status_code=400, detail="지원하지 않는 파일 형식입니다. (PDF, DOCX, TXT만 가능)")

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 파일 파싱 에러: {e}")
        raise HTTPException(status_code=500, detail="파일 내용을 읽는 중 오류가 발생했습니다.")

    full_text = "\n".join(text_parts)

    # 4. 빈 파일 체크
    if not full_text.strip():
        raise HTTPException(
            status_code=400,
            detail="파일에서 텍스트를 추출할 수 없습니다. 텍스트가 포함된 파일을 업로드해 주세요."
        )

    return full_text


def _mask_pii(text: str) -> str:
    """MVP용 PII 마스킹: 이메일, 전화번호만 확실하게 가립니다."""
    # 이메일
    email_pattern = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")
    text = email_pattern.sub('[EMAIL]', text)

    # 전화번호 (010-1234-5678, 010 1234 5678 등)
    # 너무 짧은 숫자나 연도는 건드리지 않도록 최소 길이 제한
    phone_pattern = re.compile(r"(01[016789])[\s-]?(\d{3,4})[\s-]?(\d{4})")
    text = phone_pattern.sub('[PHONE]', text)

    # 주소 마스킹은 False Positive 위험이 커서 MVP 단계에서는 제거
    return text


def _remove_noise(text: str) -> str:
    """헤더/푸터, 페이지 번호, '연속된' 중복 라인 제거."""
    lines = text.splitlines()
    out_lines = []

    # '이전 라인'과 동일한 경우에만 제거 (global dedup 방지)
    prev_line = None

    for line in lines:
        s = line.strip()
        if not s:
            continue

        # 페이지 번호 제거 (Page 1 / 5, - 1 - 등)
        if re.match(r'^(page\s*\d+)', s, re.IGNORECASE):
            continue
        if re.match(r'^\d+\s*/\s*\d+$', s):
            continue
        if re.match(r'^-\s*\d+\s*-$', s):
            continue
        if re.match(r'^\d{1,3}$', s):
            # 단순 숫자(1~3자리) 단독 라인 제거
            continue

        # 너무 짧고 의미 없을 가능성 높은 라인 필터링
        if len(s) < 3 and not any(c.isalpha() or '\u3131' <= c <= '\u3163' or '\uac00' <= c <= '\ud7a3' for c in s):
            continue

        # 연속 중복 제거
        if s == prev_line:
            continue

        out_lines.append(s)
        prev_line = s

    return "\n".join(out_lines)


def _normalize_text(text: str) -> str:
    """공백과 특수문자 정리, HTML 엔티티 제거."""
    try:
        # lxml 없으면 html.parser 사용
        soup = BeautifulSoup(text, "html.parser")
        text = soup.get_text("\n")
    except Exception:
        text = re.sub(r'<[^>]+>', '', text)

    # Unicode 공백(NBSP 등) 정규화
    text = re.sub(r"[\t\u00A0\u3000]+", ' ', text)

    # 3개 이상의 연속 개행은 2개(문단 구분)로 축소
    text = re.sub(r"\n{3,}", '\n\n', text)

    return text.strip()


def clean_and_prepare(text: str) -> str:
    """외부 호출용 메인 함수"""
    if not text:
        return ""

    # 1. 정규화 (HTML 태그 등 제거)
    text = _normalize_text(text)

    # 2. PII 마스킹 (민감정보 제거)
    text = _mask_pii(text)

    # 3. 노이즈 제거 (헤더/푸터 등)
    text = _remove_noise(text)

    # 4. 토큰 제한은 모든 정제가 끝난 후 '알맹이' 상태에서 수행
    return text[:15000]