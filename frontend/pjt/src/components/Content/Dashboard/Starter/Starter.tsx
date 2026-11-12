import { useState } from 'react';
import { STARTER_STYLES, STARTER_CARD_DATA } from './Starter.constants';
import { useStarter } from './useStarter';
import ModalFrame from '../../../starter-modals/ModalFrame';
import Step1SelectDocType from '../../../starter-modals/Step1SelectDocType/Step1SelectDocType';
import Step1DocumentType from '../../../starter-modals/Step1DocumentType';
import Step2UploadForm from '../../../starter-modals/Step2UploadForm';
import Step2HistoryList from '../../../starter-modals/Step2HistoryList';
import Step3Final from '../../../starter-modals/Step3Final';
import CSCategorySelect from '../../../starter-modals/CategorySelect/CategorySelect';

const Starter = () => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { 
    isLoggedIn, 
    activeModal, 
    setActiveModal, 
    currentStep, 
    setCurrentStep, 
    subMode, 
    setSubMode, 
    selectedDocType, 
    fileName, 
    fileId, 
    displayDocType, 
    handleClose, 
    handleDocTypeSelect, 
    handleSave, 
    handleStartInterviewAPI, 
    handleNav 
  } = useStarter();



  return (
    <section 
      className="relative w-full h-fit py-16 flex flex-col items-center overflow-visible px-4 dashboard-area"
    >
      <style>{STARTER_STYLES.floatingAnimation}</style>
      <div className="w-full mt-2 mb-10">
        <h1 className="text-2xl font-black tracking-tight text-text-main uppercase italic text-left">
          Start Your AI Interview
        </h1>
      </div>

      {/* 카드 데크 영역 - Flex 기반 아코디언 레이아웃 */}
      <div className="relative w-full flex flex-row items-center justify-center gap-6 min-h-[450px]">
        {STARTER_CARD_DATA.map((card, i) => {
          const isHovered = hoveredId === card.id;
          const isDimmed = hoveredId !== null && !isHovered;

          return (
            <button
              key={card.id}
              className={`
                ${STARTER_STYLES.cardBase} animate-float
                transition-all duration-700 ease-in-out
                ${isHovered ? 'w-[750px] h-[420px] z-30' : 'w-[280px] h-[380px] z-10'}
                ${isDimmed ? 'opacity-40 scale-95 blur-[4px]' : 'opacity-100'}
                relative flex items-center justify-center overflow-hidden
              `}
              style={{ animationDelay: `${(i + 1) * 0.2}s` }}
              onMouseEnter={() => setHoveredId(card.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => {
                if (!isLoggedIn) { alert('로그인이 필요한 서비스입니다.'); return; }
                if (card.id === 'docs') setActiveModal('DOCS');
                if (card.id === 'cs') setActiveModal('CS');
                if (card.id === 'p2p') handleNav('/p2p');
              }}
            >
              {/* 카드 내부 콘텐츠 */}
              <div className={`
                relative z-20 flex w-full h-full p-12
                ${isHovered ? 'flex-row items-center gap-16' : 'flex-col items-center justify-center'}
              `}>
                
                {/* 이미지 영역 (호버 시에만 강조됨) */}
                <div className={`
                  transition-all duration-700 ease-in-out z-30 flex flex-col items-center justify-center
                  ${isHovered ? 'w-[45%] opacity-100' : 'w-0 opacity-0 scale-50 pointer-events-none'}
                `}>
                  <div className={`transition-transform duration-700 ${isHovered ? 'scale-[1.6] translate-x-6' : ''}`}>
                    <img src={card.img} alt={card.title} className="w-full h-auto object-contain drop-shadow-[0_25px_40px_rgba(0,0,0,0.4)]" />
                  </div>
                </div>

                {/* 텍스트 영역 */}
                <div className={`
                  flex flex-col transition-all duration-700 z-20
                  ${isHovered ? 'w-[55%] items-start text-left pl-8' : 'w-full items-center text-center'}
                `}>
                  <span className={`text-[12px] font-bold mb-2 ${card.accent} tracking-[0.3em] opacity-70`}>
                    {card.tag}
                  </span>
                  
                  <h2 className={`
                    font-black tracking-tight text-text-main leading-tight mb-6
                    ${isHovered ? 'text-4xl' : 'text-3xl'}
                  `}>
                    {card.title}
                  </h2>

                  {/* 설명 영역 */}
                  <p className={`
                    text-base font-medium text-text-sub leading-relaxed tracking-tight mb-8
                    transition-all duration-500 delay-200
                    ${isHovered ? 'opacity-100 translate-y-0 max-h-40' : 'opacity-0 translate-y-4 max-h-0'}
                  `}>
                    {card.desc}
                  </p>

                  {/* START 버튼 (항상 노출) */}
                  <div className={`
                    ${STARTER_STYLES.startIndicator} ${card.accent} 
                    flex items-center gap-2 transition-all duration-500
                    opacity-100
                  `}>
                    START <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
                  </div>
                </div>
              </div>

              {/* 배경 Glow 효과 */}
              <div className={`${STARTER_STYLES.innerGlow} ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
            </button>
          );
        })}
      </div>

      <ModalFrame isOpen={activeModal !== 'NONE'} onClose={handleClose}>
        <div className="w-full">
          {activeModal === 'DOCS' && (
            <div className="relative z-20">
              {currentStep === 1 && (
                <Step1SelectDocType 
                  onSelect={handleDocTypeSelect}
                  onBack={handleClose}
                />
              )}
              
              {currentStep === 2 && subMode === 'MAIN' && (
                <Step1DocumentType 
                  title={displayDocType}
                  onNew={() => setSubMode('NEW')}
                  onHistory={() => setSubMode('HISTORY')}
                  onBack={() => setCurrentStep(1)}
                />
              )}

              {subMode === 'NEW' && (
                <Step2UploadForm 
                  type={displayDocType} 
                  uploadType={selectedDocType}
                  onBack={() => setSubMode('MAIN')} 
                  onConfirm={handleSave} 
                />
              )}

              {subMode === 'HISTORY' && (
                <Step2HistoryList 
                  type={displayDocType} 
                  onBack={() => setSubMode('MAIN')} 
                  onConfirm={handleSave} 
                />
              )}

              {currentStep === 3 && (
                <Step3Final 
                  docName={fileName} 
                  docId={fileId}     
                  docType={selectedDocType} 
                  onBack={() => setCurrentStep(2)}
                  onStartInterview={handleStartInterviewAPI} 
                />
              )}
            </div>
          )}
          {activeModal === 'CS' && <CSCategorySelect onBack={handleClose} />}
        </div>
      </ModalFrame>
    </section>
  );
};

export default Starter;
