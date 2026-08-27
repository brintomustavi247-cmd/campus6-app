import React, { useState } from 'react';
import { BookOpen, X, Check, ChevronRight, ArrowLeft, Target } from 'lucide-react';
import {
  HSC_SYLLABUS,
  SyllabusSubject,
  SyllabusPaper,
  SyllabusChapter,
  SyllabusTopic,
  TopicPickerMode,
  getTopicPickerMode,
  setTopicPickerMode,
  getSyllabusLang,
  subjectName,
  paperName,
  chapterTitle,
  topicLabel,
} from '../data/hscSyllabus';

interface TopicPickerModalProps {
  open: boolean;
  onClose: () => void;
  /** Called with the final topic string to feed into the timer */
  onPick: (topicLabel: string) => void;
}

type Step = 'subject' | 'paper' | 'chapter' | 'topic';

export const TopicPickerModal: React.FC<TopicPickerModalProps> = ({ open, onClose, onPick }) => {
  const [mode, setMode] = useState<TopicPickerMode>(() => getTopicPickerMode());
  const lang = getSyllabusLang(); // 'bn', 'en', or 'both'
  const [step, setStep] = useState<Step>('subject');
  const [subject, setSubject] = useState<SyllabusSubject | null>(null);
  const [paper, setPaper] = useState<SyllabusPaper | null>(null);
  const [chapter, setChapter] = useState<SyllabusChapter | null>(null);
  const [freeText, setFreeText] = useState('');

  const reset = () => {
    setStep('subject');
    setSubject(null);
    setPaper(null);
    setChapter(null);
    setFreeText('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const toggleMode = (m: TopicPickerMode) => {
    setMode(m);
    setTopicPickerMode(m);
    if (m === 'free') reset();
  };

  const confirmFree = () => {
    const t = freeText.trim();
    if (!t) return;
    onPick(t);
    handleClose();
  };

  const confirmTopic = (topic: SyllabusTopic) => {
    if (!subject || !chapter) return;
    // Saved topic follows the app language
    const subjectPart = lang === 'en' ? subject.name_en : subject.name_bn;
    const topicPart = lang === 'en' ? topic.en : topic.bn;
    onPick(`${subjectPart} · ${topicPart}`);
    handleClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-10000 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg max-h-[85vh] rounded-2xl bg-[#171924] border border-white/10 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2 text-cyan-300">
            <BookOpen className="w-5 h-5" />
            <h3 className="text-sm font-bold text-white">
              {mode === 'syllabus' ? 'What are you studying?' : 'Free Mode — type your topic'}
            </h3>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode toggle switch — fixed px sizing so it looks identical on mobile & desktop */}
        <div className="px-5 py-3 border-b border-white/5 shrink-0 flex items-center justify-center gap-3 select-none">
          <span
            className={`text-xs font-semibold transition-colors ${
              mode === 'syllabus' ? 'text-cyan-300' : 'text-slate-500'
            }`}
          >
            Pick from HSC syllabus
          </span>

          <button
            type="button"
            role="switch"
            aria-checked={mode === 'free'}
            aria-label="Toggle between syllabus picker and free text mode"
            onClick={() => toggleMode(mode === 'syllabus' ? 'free' : 'syllabus')}
            style={{ width: 52, height: 28, padding: 3 }}
            className={`relative shrink-0 rounded-full transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 ${
              mode === 'free' ? 'bg-emerald-500' : 'bg-slate-600'
            }`}
          >
            <span
              style={{
                width: 22,
                height: 22,
                transform: mode === 'free' ? 'translateX(24px)' : 'translateX(0px)',
              }}
              className="block rounded-full bg-white shadow-md transition-transform duration-200"
            />
          </button>

          <span
            className={`text-xs font-semibold transition-colors ${
              mode === 'free' ? 'text-emerald-300' : 'text-slate-500'
            }`}
          >
            Free text
          </span>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {mode === 'free' ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Type any topic you want — it will be saved with your session.
              </p>
              <textarea
                autoFocus
                rows={3}
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                placeholder="e.g. ভেক্টর-১ রিভিশন, Organic Chemistry MCQ..."
                className="w-full p-3 rounded-xl bg-[#0F111A] border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400 resize-none"
              />
              <button
                onClick={confirmFree}
                disabled={!freeText.trim()}
                className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" /> Start Studying
              </button>
            </div>
          ) : (
            <SyllabusFlow
              lang={lang}
              step={step}
              setStep={setStep}
              subject={subject}
              setSubject={setSubject}
              paper={paper}
              setPaper={setPaper}
              chapter={chapter}
              setChapter={setChapter}
              onPickTopic={confirmTopic}
            />
          )}
        </div>
      </div>
    </div>
  );
};

/* ───────────────────────── Syllabus drill-down flow ───────────────────────── */

interface FlowProps {
  lang: 'bn' | 'en' | 'both';
  step: Step;
  setStep: (s: Step) => void;
  subject: SyllabusSubject | null;
  setSubject: (s: SyllabusSubject) => void;
  paper: SyllabusPaper | null;
  setPaper: (p: SyllabusPaper) => void;
  chapter: SyllabusChapter | null;
  setChapter: (c: SyllabusChapter) => void;
  onPickTopic: (t: SyllabusTopic) => void;
}

const SyllabusFlow: React.FC<FlowProps> = ({
  lang, step, setStep, subject, setSubject, paper, setPaper, chapter, setChapter, onPickTopic,
}) => {
  const subjects = HSC_SYLLABUS.subjects;

  const breadcrumb = (
    <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-3 flex-wrap">
      <span className={step === 'subject' ? 'text-cyan-300 font-bold' : ''}>Subject</span>
      {subject && <><ChevronRight className="w-3 h-3" /><span className={step === 'paper' ? 'text-cyan-300 font-bold' : ''}>{subjectName(subject, lang)}</span></>}
      {paper && <><ChevronRight className="w-3 h-3" /><span className={step === 'chapter' ? 'text-cyan-300 font-bold' : ''}>{paperName(paper, lang)}</span></>}
      {chapter && <><ChevronRight className="w-3 h-3" /><span className={step === 'topic' ? 'text-cyan-300 font-bold' : ''}>Ch {chapter.chapter_no}</span></>}
    </div>
  );

  const back = () => {
    if (step === 'topic') setStep('chapter');
    else if (step === 'chapter') setStep('paper');
    else if (step === 'paper') setStep('subject');
  };

  return (
    <div>
      {breadcrumb}
      {step !== 'subject' && (
        <button onClick={back} className="flex items-center gap-1 text-xs text-slate-400 hover:text-white mb-3">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
      )}

      {step === 'subject' && (
        <div className="grid grid-cols-2 gap-2.5">
          {subjects.map((s) => (
            <button
              key={s.id}
              onClick={() => { setSubject(s); setStep(s.papers.length > 1 ? 'paper' : 'chapter'); if (s.papers.length === 1) setPaper(s.papers[0]); }}
              className="p-3.5 rounded-xl bg-[#0F111A] border border-white/10 hover:border-cyan-400/60 hover:bg-cyan-500/5 text-left transition-all"
            >
              <div className="text-sm font-bold text-white leading-tight">{subjectName(s, lang)}</div>
            </button>
          ))}
        </div>
      )}

      {step === 'paper' && subject && (
        <div className="space-y-2.5">
          {subject.papers.map((p) => (
            <button
              key={p.paper}
              onClick={() => { setPaper(p); setStep('chapter'); }}
              className="w-full p-3.5 rounded-xl bg-[#0F111A] border border-white/10 hover:border-cyan-400/60 hover:bg-cyan-500/5 text-left transition-all flex items-center justify-between"
            >
              <div>
                <div className="text-sm font-bold text-white leading-tight">{paperName(p, lang)}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          ))}
        </div>
      )}

      {step === 'chapter' && paper && (
        <div className="space-y-2">
          {paper.chapters.map((c) => (
            <button
              key={c.chapter_no}
              onClick={() => { setChapter(c); setStep('topic'); }}
              className="w-full p-3 rounded-xl bg-[#0F111A] border border-white/10 hover:border-cyan-400/60 hover:bg-cyan-500/5 text-left transition-all flex items-center gap-3"
            >
              <span className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 text-xs font-bold flex items-center justify-center shrink-0">
                {c.chapter_no}
              </span>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white truncate leading-tight">{chapterTitle(c, lang)}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {step === 'topic' && chapter && (
        <div className="space-y-2">
          <p className="text-[11px] text-slate-400 mb-1">Choose a specific topic:</p>
          {chapter.topics.map((t, i) => (
            <button
              key={i}
              onClick={() => onPickTopic(t)}
              className="w-full p-3 rounded-xl bg-[#0F111A] border border-white/10 hover:border-emerald-400/60 hover:bg-emerald-500/5 text-left transition-all flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium text-white leading-snug">{topicLabel(t, lang)}</div>
              </div>
              <Target className="w-4 h-4 text-slate-500 shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopicPickerModal;