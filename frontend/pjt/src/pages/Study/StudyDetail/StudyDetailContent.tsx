import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { StudyPost } from './StudyDetail.types';
import { MARKDOWN_STYLES, COMPONENT_CLASSES, SEMANTIC_COLORS } from './StudyDetail.constants';

interface StudyDetailContentProps {
  post: StudyPost;
  showFollowUps: boolean;
  setShowFollowUps: (show: boolean) => void;
  navigate: (path: string, options?: { state: any }) => void;
}

const MarkdownComponents = {
  h1: ({ node, ...props }: any) => <h1 className={MARKDOWN_STYLES.h1} {...props} />,
  h2: ({ node, ...props }: any) => <h2 className={MARKDOWN_STYLES.h2} {...props} />,
  h3: ({ node, ...props }: any) => <h3 className={MARKDOWN_STYLES.h3} {...props} />,
  p: ({ node, ...props }: any) => <p className={MARKDOWN_STYLES.p} {...props} />,
  ul: ({ node, ...props }: any) => <ul className={MARKDOWN_STYLES.ul} {...props} />,
  ol: ({ node, ...props }: any) => <ol className={MARKDOWN_STYLES.ol} {...props} />,
  li: ({ node, ...props }: any) => <li className={MARKDOWN_STYLES.li} {...props} />,
  blockquote: ({ node, ...props }: any) => <blockquote className={MARKDOWN_STYLES.blockquote} {...props} />,
  code({ node, inline, className, children, ...props }: any) {
    const match = /language-(\w+)/.exec(className || '')
    return !inline && match ? (
      <div className={MARKDOWN_STYLES.codeBlockWrapper}>
         <div className={MARKDOWN_STYLES.codeBlockHeader}>
           <span>{match[1]}</span>
           <button onClick={() => navigator.clipboard.writeText(String(children))} className={MARKDOWN_STYLES.codeBlockCopyButton}>Copy</button>
          </div>
        <SyntaxHighlighter
          style={atomDark}
          language={match[1]}
          PreTag="div"
          customStyle={{ margin: 0, padding: '1.5rem', backgroundColor: 'transparent' }}
          showLineNumbers={true}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      </div>
    ) : (
      <code className={MARKDOWN_STYLES.inlineCode} {...props}>
        {children}
      </code>
    )
  }
};

const StudyDetailContent: React.FC<StudyDetailContentProps> = ({ post, showFollowUps, setShowFollowUps, navigate }) => {
  return (
    <main className="bg-transparent">
        {post.content ? (
          <>
            {post.modelAnswer && (
              <div className={SEMANTIC_COLORS.borderDefault}>
                <h2 className="text-xl font-bold text-accent-primary mb-3">모범 답안</h2>
                <ReactMarkdown components={MarkdownComponents as any}>
                    {post.modelAnswer}
                </ReactMarkdown>
              </div>
            )}
            {post.followUpQuestions && post.followUpQuestions.length > 0 && (
              <div className={`mt-8 border-t ${SEMANTIC_COLORS.borderDefault} pt-6`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-h3 font-bold text-accent-default flex items-center gap-3`}>
                    <span>후속 질문</span>
                    <button
                      onClick={() => setShowFollowUps(!showFollowUps)}
                      className={`p-1 rounded-md ${SEMANTIC_COLORS.bgSurface} hover:${SEMANTIC_COLORS.bgSurface} transition-colors flex items-center justify-center`}
                      aria-expanded={showFollowUps}
                      aria-controls="followup-list"
                      title={showFollowUps ? '후속 질문 숨기기' : `후속 질문 보기 (${post.followUpQuestions.length})`}
                    >
                      {showFollowUps ? <ChevronUp size={18} className="text-accent-default" /> : <ChevronDown size={18} className="text-accent-default" />}
                    </button>
                  </h3>
                  <div />
                </div>

                <div id="followup-list" className={`${showFollowUps ? 'block' : 'hidden'}`}>
                  <div className="space-y-6">
                    {post.followUpQuestions.map((f) => (
                      <div
                        key={f.questionId}
                        role="button"
                        tabIndex={0}
                        onClick={() => navigate(`/study/post/${f.questionId}`, { state: { title: f.content, category: post.category, page: 0 } })}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/study/post/${f.questionId}`, { state: { title: f.content, category: post.category, page: 0 } }); }}
                        className={`${COMPONENT_CLASSES.cardStandard} ${SEMANTIC_COLORS.bgSurface} border ${SEMANTIC_COLORS.borderDefault} rounded-lg p-4 cursor-pointer hover:shadow-lg hover:border-accent-default transition-all`}
                      >
                        <p className={`text-md ${SEMANTIC_COLORS.textMain} font-semibold mb-2`}>{f.content}</p>
                        {f.modelAnswer && (
                          <div className={`text-sm ${SEMANTIC_COLORS.textSub}`}>
                            <strong className="text-accent-primary">모범 답안: </strong>
                            <span>{f.modelAnswer}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
            <p className={SEMANTIC_COLORS.textTertiary}>내용을 불러오는 중입니다...</p>
        )}
    </main>
  );
};

export default StudyDetailContent;