import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { boardsService } from '../../api/myBoardsService';

const EditPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await boardsService.getBoard(Number(id));
        setTitle(data.title || '');
        setContent(data.content || '');
        setExistingImageUrl(data.imageUrl || null);
        setImagePreview(data.imageUrl || null);
        console.log('[EditPostPage] loaded post:', data);
      } catch (err) {
        console.error('[EditPostPage] load error:', err);
        setError('게시글을 불러오지 못했습니다.');
      }
    })();
  }, [id]);

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

  const handleRemoveImage = () => {
    setImageFile(null);
    setExistingImageUrl(null);
    if (imagePreview) {
      try { URL.revokeObjectURL(imagePreview); } catch (e) {}
      setImagePreview(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const req: any = { title, content };
      // If no new imageFile, pass imageUrl (could be null to remove)
      if (!imageFile) req.imageUrl = existingImageUrl ?? null;
      console.log('[EditPostPage] submitting req:', req, 'imageFile:', imageFile);
      const res = await boardsService.updateBoard(Number(id), req, imageFile || undefined);
      console.log('[boardsService.updateBoard] 응답:', res);
      alert('게시글이 수정되었습니다.');
      navigate(`/community/${id}`);
    } catch (err: any) {
      console.error('[EditPostPage] update error:', err);
      setError(err?.response?.data?.message || '수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white px-4 pt-24 pb-20">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">게시글 수정</h1>
        </header>

        {error && <div className="mb-4 text-red-400 text-center">{error}</div>}

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
            <label className="block mb-2 font-semibold">이미지 파일 (선택)</label>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="flex items-center justify-center flex-col gap-3 p-6 rounded-lg border-2 border-dashed border-zinc-700 bg-zinc-900 hover:border-blue-600 cursor-pointer text-center min-h-[220px]"
            >
              {imagePreview ? (
                <div className="w-full flex flex-col items-center gap-3">
                  {/* If preview is an external URL, allow it */}
                  <img src={imagePreview} alt="preview" className="max-h-48 object-contain rounded" />
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">파일 변경</button>
                    <button type="button" onClick={handleRemoveImage} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded">이미지 제거</button>
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

          <button type="submit" disabled={loading} className="w-full py-4 rounded-lg bg-blue-600 hover:bg-blue-700 font-bold text-lg transition-colors disabled:opacity-50">
            {loading ? '수정 중...' : '수정하기'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditPostPage;
