
import React, { useState } from 'react';
import { COURSES } from '../constants';
import { PlayIcon, CheckBadgeIcon, PlayCircleIcon, AcademicCapIcon, ArrowLeftIcon } from './Icons';
import type { Course, Module, Lesson } from '../types';

const Courses: React.FC = () => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  // Helper to auto-select first lesson when course opens
  const handleCourseSelect = (course: Course) => {
      setSelectedCourse(course);
      if (course.modules.length > 0 && course.modules[0].lessons.length > 0) {
          setActiveLesson(course.modules[0].lessons[0]);
      }
  };

  if (selectedCourse) {
    return (
      <div className="h-full flex flex-col bg-[#05050a]">
        {/* Header */}
        <div className="h-16 border-b border-white/5 flex items-center px-6 bg-brand-surface/80 backdrop-blur-xl z-20">
          <button 
            onClick={() => { setSelectedCourse(null); setActiveLesson(null); }}
            className="flex items-center gap-2 text-brand-text-secondary hover:text-white transition-colors group"
          >
            <div className="p-1.5 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                 <ArrowLeftIcon className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">Voltar aos Cursos</span>
          </button>
          <div className="h-6 w-[1px] bg-white/10 mx-6"></div>
          <h2 className="text-lg font-bold text-white tracking-tight">{selectedCourse.title}</h2>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Video Player Area */}
          <div className="flex-1 bg-black flex flex-col overflow-y-auto relative">
             <div className="w-full aspect-video bg-gray-900 relative group shadow-2xl">
                {activeLesson?.videoUrl ? (
                     <video 
                        key={activeLesson.id}
                        controls 
                        autoPlay={false}
                        poster={activeLesson.poster}
                        className="w-full h-full object-cover"
                     >
                        <source src={activeLesson.videoUrl} type="video/mp4" />
                        Seu navegador não suporta vídeo.
                     </video>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                        <p className="text-brand-text-secondary">Vídeo indisponível</p>
                    </div>
                )}
             </div>

             <div className="p-8 md:p-10 max-w-5xl mx-auto w-full">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full bg-brand-accent/10 text-brand-accent text-xs font-bold border border-brand-accent/20 uppercase tracking-wider">
                            Aula Atual
                        </span>
                        <span className="text-brand-text-secondary text-sm font-mono">{activeLesson?.duration} min</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">{activeLesson?.title}</h1>
                    <p className="text-brand-text-secondary text-lg leading-relaxed mt-2">
                        Esta aula cobre conceitos fundamentais de IA generativa. O conteúdo é projetado para fornecer uma compreensão profunda da arquitetura técnica e aplicação prática.
                    </p>
                    
                    {/* Resources Placeholder */}
                    <div className="mt-8 pt-8 border-t border-white/10">
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Recursos da Aula</h4>
                        <div className="flex gap-4">
                            <button className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-brand-text-secondary hover:text-white transition-colors">
                                Download Slides (PDF)
                            </button>
                            <button className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-brand-text-secondary hover:text-white transition-colors">
                                Código Fonte (GitHub)
                            </button>
                        </div>
                    </div>
                </div>
             </div>
          </div>

          {/* Sidebar Syllabus */}
          <div className="w-full lg:w-96 bg-[#0A0C14] border-l border-white/5 overflow-y-auto custom-scrollbar flex-shrink-0 z-10">
            <div className="p-6 border-b border-white/5 bg-[#0A0C14]/90 backdrop-blur-sm sticky top-0 z-10">
                <h3 className="font-bold text-white mb-1">Conteúdo do Curso</h3>
                <div className="flex justify-between items-center">
                    <p className="text-xs text-brand-text-secondary">{selectedCourse.modules.reduce((acc, m) => acc + m.lessons.length, 0)} Aulas</p>
                    <div className="h-1 w-24 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-accent w-1/3"></div>
                    </div>
                </div>
            </div>
            
            <div className="p-4 space-y-6">
                {selectedCourse.modules.map((module, idx) => (
                    <div key={module.id}>
                        <h4 className="text-[10px] font-bold text-brand-text-secondary/70 uppercase tracking-widest mb-3 px-2 font-mono">
                            Módulo {idx + 1} • {module.title}
                        </h4>
                        <div className="space-y-1">
                            {module.lessons.map((lesson) => (
                                <button 
                                    key={lesson.id}
                                    onClick={() => setActiveLesson(lesson)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all group border ${
                                        activeLesson?.id === lesson.id 
                                        ? 'bg-brand-accent/10 border-brand-accent/50 text-white' 
                                        : 'border-transparent text-brand-text-secondary hover:bg-white/5 hover:text-white'
                                    }`}
                                >
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${
                                        activeLesson?.id === lesson.id 
                                        ? 'bg-brand-accent text-white border-brand-accent'
                                        : 'bg-white/5 border-white/10 group-hover:border-white/30'
                                    }`}>
                                         {lesson.isCompleted ? (
                                            <CheckBadgeIcon className="h-4 w-4" />
                                        ) : activeLesson?.id === lesson.id ? (
                                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                        ) : (
                                            <PlayCircleIcon className="h-4 w-4 opacity-50" />
                                        )}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{lesson.title}</p>
                                        <p className={`text-[10px] font-mono mt-0.5 ${activeLesson?.id === lesson.id ? 'text-brand-accent' : 'text-brand-text-secondary/50'}`}>
                                            {lesson.duration}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 md:p-12 custom-scrollbar">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-brand-accent/10 rounded-2xl border border-brand-accent/20 backdrop-blur-sm">
                <AcademicCapIcon className="h-8 w-8 text-brand-accent" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Academy</h1>
          </div>
          <p className="text-brand-text-secondary text-lg max-w-2xl leading-relaxed border-l-2 border-brand-accent/50 pl-6">
            Aprenda a dominar a IA com cursos de ponta. Conteúdo técnico profundo sobre Prompting, Arquitetura de Agentes e Mídia Generativa.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-10">
            {COURSES.map(course => (
                <button 
                    key={course.id} 
                    onClick={() => handleCourseSelect(course)}
                    className="group relative flex flex-col h-[380px] w-full text-left"
                >
                    {/* Card Container */}
                    <div className="relative w-full h-full rounded-3xl overflow-hidden bg-brand-secondary border border-white/10 hover:border-brand-accent/50 transition-all duration-500 hover:shadow-2xl hover:shadow-brand-accent/10 group-hover:-translate-y-2">
                        
                        {/* Cover Image Area */}
                        <div className={`h-3/5 relative overflow-hidden`}>
                            {/* Simulating Course Cover Image with Gradients/Patterns for now, or use a real image if added to types later. Using abstract gradients based on course prop. */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${course.coverGradient} opacity-80`}></div>
                            <img 
                                src={`https://source.unsplash.com/random/800x600?tech,${course.id}`} 
                                onError={(e) => e.currentTarget.src = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop'}
                                className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                                alt="Course cover"
                            />
                            
                            <div className="absolute inset-0 bg-gradient-to-t from-brand-secondary via-brand-secondary/50 to-transparent"></div>
                            
                            <div className="absolute top-4 left-4">
                                <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-wider shadow-lg">
                                    {course.level}
                                </span>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="p-6 flex-1 flex flex-col relative -mt-12">
                             {/* Floating Icon */}
                             <div className="w-12 h-12 rounded-xl bg-brand-surface border border-white/10 flex items-center justify-center shadow-xl mb-4 group-hover:bg-brand-accent group-hover:text-white transition-colors duration-300 z-10">
                                <PlayIcon className="h-5 w-5 text-white" />
                             </div>

                            <h3 className="text-2xl font-bold text-white leading-tight mb-2 group-hover:text-brand-accent transition-colors">
                                {course.title}
                            </h3>
                            <p className="text-brand-text-secondary text-sm line-clamp-2 leading-relaxed mb-4">
                                {course.description}
                            </p>
                            
                            <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between text-xs text-brand-text-secondary">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center font-bold text-[8px] text-white border border-white/10">MH</div>
                                    <span className="font-mono opacity-70">{course.author}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="font-bold text-white">{course.modules.length}</span> Módulos
                                </div>
                            </div>
                        </div>
                    </div>
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Courses;
