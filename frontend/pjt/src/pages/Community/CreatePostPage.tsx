import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { boardsService } from '../../api/myBoardsService';

const CreatePostPage: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setImageFile(f);
    const url = URL.createObjectURL(f);
    setImagePreview(url);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    if (!f) return;
    setImageFile(f);
    const url = URL.createObjectURL(f);
    setImagePreview(url);
  };

  const handleRemoveFile = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const req = imageFile ? { title, content } : { title, content, imageUrl: null };
      const res = await boardsService.createBoard(req, imageFile || undefined);
      console.log('[boardsService.createBoard] 응답:', res);
      alert('게시글이 생성되었습니다!');
      navigate('/community');
    } catch (err: any) {
      setError(err?.response?.data?.message || '게시글 작성에 실패했습니다.');
      console.error('[boardsService.createBoard] 에러:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white px-4 pt-24 pb-20">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-2">게시글 작성</h1>
          <p className="text-zinc-400">지식을 공유하는 게시글을 작성하세요</p>
        </header>

        <form onSubmit={handleSubmit} className="w-full bg-zinc-900 p-8 rounded-2xl shadow-lg border border-zinc-800">
          <div className="mb-4">
            <label className="block mb-2 font-semibold">제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 rounded bg-zinc-800 border border-zinc-700 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-semibold">내용</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-2 rounded bg-zinc-800 border border-zinc-700 focus:outline-none focus:border-blue-500 min-h-[200px]"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block mb-2 font-semibold">이미지 파일 업로드 (선택)</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="flex items-center justify-center flex-col gap-3 p-6 rounded-lg border-2 border-dashed border-zinc-700 bg-zinc-900 hover:border-blue-600 cursor-pointer text-center min-h-[220px]"
            >
              {imagePreview ? (
                <div className="w-full flex flex-col items-center gap-3">
                  <img src={imagePreview} alt="preview" className="max-h-48 object-contain rounded" />
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">파일 변경</button>
                    <button type="button" onClick={handleRemoveFile} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded">삭제</button>
                  </div>
                  <p className="text-xs text-zinc-400">드래그 앤 드롭으로 업로드 가능</p>
                </div>
              ) : (
                <div className="text-zinc-400">
                  <p className="font-semibold text-zinc-200">파일을 클릭하거나 여기에 드래그하세요</p>
                  <p className="text-sm mt-1">PNG, JPG, JPEG 형식을 지원합니다. (선택)</p>
                </div>
              )}
            </div>
          </div>

          {error && <div className="mb-4 text-red-400 text-center">{error}</div>}

          <button
            type="submit"
            className="w-full py-4 rounded-lg bg-blue-600 hover:bg-blue-700 font-bold text-lg transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? '작성 중...' : '작성하기'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePostPage;
