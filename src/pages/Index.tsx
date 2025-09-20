import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Star, Send, Users, TrendingUp, MessageSquare, Shield, User, ChevronDown, Filter, BarChart3, Eye, Clock, Award, Search, X, ArrowRight, Zap, Target, Sparkles } from 'lucide-react';

interface Teacher {
  id: number;
  name: string;
  department: string;
  subject: string;
}

interface Feedback {
  id: number;
  anonymousId: string;
  comment: string;
  rating: number;
  timestamp: string;
}

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const FeedbackApp: React.FC = () => {
  // Sample teachers data
  const [teachers] = useState<Teacher[]>([
    { id: 1, name: 'Dr. Rajesh Kumar', department: 'Computer Science', subject: 'Data Structures' },
    { id: 2, name: 'Prof. Priya Sharma', department: 'Mathematics', subject: 'Linear Algebra' },
    { id: 3, name: 'Dr. Arjun Menon', department: 'Physics', subject: 'Quantum Mechanics' },
    { id: 4, name: 'Prof. Kavitha Nair', department: 'Chemistry', subject: 'Organic Chemistry' },
    { id: 5, name: 'Dr. Suresh Babu', department: 'Computer Science', subject: 'Machine Learning' },
    { id: 6, name: 'Prof. Meera Das', department: 'English', subject: 'Technical Writing' },
  ]);

  // App state
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [anonymousId, setAnonymousId] = useState<string>('');
  const [feedbackData, setFeedbackData] = useState<Record<number, Feedback[]>>({});
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [activeStatsCard, setActiveStatsCard] = useState<string | null>(null);

  // FIXED: Separate states for feedback form
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [feedbackRating, setFeedbackRating] = useState<number>(0);

  // Add refs
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Initialize anonymous user ID
  useEffect(() => {
    const randomId = Math.floor(Math.random() * 1000) + 1;
    setAnonymousId(`Anonymous ${randomId}`);
  }, []);

  // Focus search input when it becomes visible
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [showSearch]);

  // Calculate average rating for a teacher
  const calculateAverageRating = useCallback((teacherId: number): string => {
    const teacherFeedbacks = feedbackData[teacherId] || [];
    if (teacherFeedbacks.length === 0) return '0.0';
    const sum = teacherFeedbacks.reduce((acc, fb) => acc + fb.rating, 0);
    return (sum / teacherFeedbacks.length).toFixed(1);
  }, [feedbackData]);

  // Get feedback count for a teacher
  const getFeedbackCount = useCallback((teacherId: number): number => {
    return (feedbackData[teacherId] || []).length;
  }, [feedbackData]);

  // Submit feedback
  const submitFeedback = useCallback(() => {
    if (!selectedTeacher) {
      alert('Please select a teacher');
      return;
    }
    
    if (!feedbackText.trim()) {
      alert('Please enter your feedback');
      return;
    }
    
    if (feedbackRating === 0) {
      alert('Please provide a rating');
      return;
    }

    const newFeedback: Feedback = {
      id: Date.now(),
      anonymousId,
      comment: feedbackText.trim(),
      rating: feedbackRating,
      timestamp: new Date().toISOString(),
    };

    setFeedbackData(prev => ({
      ...prev,
      [selectedTeacher.id]: [...(prev[selectedTeacher.id] || []), newFeedback]
    }));

    // Reset form
    setFeedbackText('');
    setFeedbackRating(0);
    setCurrentView('success');
  }, [selectedTeacher, feedbackText, feedbackRating, anonymousId]);

  // Get unique departments
  const departments = useMemo(() => {
    return [...new Set(teachers.map(teacher => teacher.department))];
  }, [teachers]);

  // Filter and sort teachers with search
  const filteredAndSortedTeachers = useMemo(() => {
    let filtered = teachers;
    
    if (filterDepartment !== 'all') {
      filtered = teachers.filter(teacher => teacher.department === filterDepartment);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(teacher => 
        teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.subject.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return Number(calculateAverageRating(b.id)) - Number(calculateAverageRating(a.id));
        case 'feedbacks':
          return getFeedbackCount(b.id) - getFeedbackCount(a.id);
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [teachers, filterDepartment, sortBy, searchQuery, calculateAverageRating, getFeedbackCount]);

  // Format time ago
  const timeAgo = useCallback((timestamp: string): string => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  }, []);

  // Total feedback count
  const totalFeedbackCount = useMemo(() => {
    return Object.values(feedbackData).reduce((sum, feedbacks) => sum + feedbacks.length, 0);
  }, [feedbackData]);

  // Handle stats card interactions
  const handleStatsCardClick = useCallback((cardType: string) => {
    setActiveStatsCard(cardType);
    
    if (cardType === 'faculty') {
      setShowSearch(true);
      setFilterDepartment('all');
      setSearchQuery('');
    } else if (cardType === 'departments') {
      setShowSearch(false);
    } else if (cardType === 'reviews') {
      setShowSearch(false);
      setSortBy('feedbacks');
    }
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setShowSearch(false);
    setActiveStatsCard(null);
  }, []);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setFilterDepartment('all');
    setSortBy('name');
    setActiveStatsCard(null);
    setShowSearch(false);
  }, []);

  // Handle search input change
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  // Handle department filter change
  const handleDepartmentChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterDepartment(e.target.value);
  }, []);

  // Handle sort change
  const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  }, []);

  // Handle individual filter removal
  const removeSearchFilter = useCallback(() => {
    setSearchQuery('');
  }, []);

  const removeDepartmentFilter = useCallback(() => {
    setFilterDepartment('all');
  }, []);

  const removeActiveStatsFilter = useCallback(() => {
    setActiveStatsCard(null);
  }, []);

  // NUCLEAR FIX: Completely isolated textarea component
  const FeedbackTextarea = React.memo(() => {
    const textareaRef = useRef<HTMLInputElement>(null);
    
    return (
      <div className="space-y-2">
        <label className="block text-lg font-bold text-cyan-300">
          Share Your Experience
        </label>
        <input
          ref={textareaRef}
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          type="text"
          placeholder="How was the teaching? What did you like? Any suggestions for improvement?"    
          className="w-full px-6 py-4 border border-purple-500/30 rounded-2xl focus:ring-4 focus:ring-cyan-500/30 focus:border-cyan-400 resize-none bg-gray-900/90 backdrop-blur-sm font-medium transition-all duration-300 text-cyan-100 placeholder-gray-400"
          autoComplete="off"
          spellCheck={true}
          autoFocus
        />
      </div>
    );
  });

  // StarRating component
  const StarRating: React.FC<StarRatingProps> = React.memo(({ value, onChange, readOnly = false, size = 'md' }) => {
    const starSize = size === 'sm' ? 16 : size === 'lg' ? 32 : 24;
    
    const handleStarClick = useCallback((star: number) => {
      if (!readOnly && onChange) {
        onChange(star);
      }
    }, [readOnly, onChange]);
    
    return (
      <div className="flex gap-1 items-center">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => handleStarClick(star)}
            className={`transition-all duration-200 ${
              star <= value
                ? 'text-cyan-400 fill-current drop-shadow-sm scale-110'
                : 'text-gray-500 hover:text-cyan-300'
            } ${!readOnly ? 'hover:scale-125 cursor-pointer' : ''}`}
          >
            <Star size={starSize} />
          </button>
        ))}
        <span className={`ml-2 font-semibold ${
          size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : 'text-sm'
        } text-cyan-300`}>
          ({value}/10)
        </span>
      </div>
    );
  });

  // Enhanced Stats Cards Component
  const StatsCards = React.memo(() => (
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      {/* Expert Faculty Card */}
      <div 
        className={`group relative overflow-hidden cursor-pointer transition-all duration-700 transform hover:scale-105 hover:-rotate-1 ${
          activeStatsCard === 'faculty' ? 'scale-105 shadow-2xl ring-4 ring-cyan-500/30' : ''
        }`}
        onClick={() => handleStatsCardClick('faculty')}
      >
        <div className="relative bg-gradient-to-br from-purple-900/90 via-purple-800/90 to-indigo-900/90 p-8 rounded-3xl shadow-2xl border border-purple-500/30">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-cyan-400/10 to-transparent rounded-full blur-2xl"></div>
          
          <div className="absolute top-4 right-4 w-2 h-2 bg-cyan-400/40 rounded-full animate-pulse"></div>
          <div className="absolute bottom-8 right-8 w-1 h-1 bg-purple-400/60 rounded-full animate-ping animation-delay-1000"></div>
          
          <div className="relative flex items-center gap-6">
            <div className="relative">
              <div className="p-5 bg-cyan-500/15 backdrop-blur-sm rounded-2xl shadow-xl group-hover:scale-110 transition-transform duration-500">
                <Users className="w-10 h-10 text-cyan-300 drop-shadow-lg" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full animate-bounce"></div>
            </div>
            <div className="flex-1">
              <h3 className="text-4xl font-black text-cyan-300 mb-2 drop-shadow-lg">
                {teachers.length}
              </h3>
              <p className="text-purple-200 font-bold text-lg tracking-wide">Expert Faculty</p>
              <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <Search className="w-4 h-4 text-cyan-200" />
                <span className="text-cyan-200 text-sm font-medium">Click to search faculty</span>
              </div>
            </div>
            <ArrowRight className="w-6 h-6 text-purple-300/60 group-hover:text-cyan-300 group-hover:translate-x-2 transition-all duration-300" />
          </div>
        </div>
      </div>

      {/* Live Reviews Card */}
      <div 
        className={`group relative overflow-hidden cursor-pointer transition-all duration-700 transform hover:scale-105 hover:rotate-1 ${
          activeStatsCard === 'reviews' ? 'scale-105 shadow-2xl ring-4 ring-pink-500/30' : ''
        }`}
        onClick={() => handleStatsCardClick('reviews')}
      >
        <div className="relative bg-gradient-to-br from-pink-900/90 via-purple-800/90 to-indigo-900/90 p-8 rounded-3xl shadow-2xl border border-pink-500/30">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-400/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-pink-400/10 to-transparent rounded-full blur-xl"></div>
          
          <div className="absolute top-6 left-6 w-3 h-3 bg-pink-400/50 rounded-full animate-pulse animation-delay-500"></div>
          <div className="absolute bottom-6 left-6 w-1.5 h-1.5 bg-purple-400/70 rounded-full animate-bounce animation-delay-700"></div>
          
          <div className="relative flex items-center gap-6">
            <div className="relative">
              <div className="p-5 bg-pink-500/15 backdrop-blur-sm rounded-2xl shadow-xl group-hover:scale-110 transition-transform duration-500">
                <MessageSquare className="w-10 h-10 text-pink-300 drop-shadow-lg" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                <Zap className="w-3 h-3 text-yellow-800" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-4xl font-black text-pink-300 mb-2 drop-shadow-lg">
                {totalFeedbackCount}
              </h3>
              <p className="text-purple-200 font-bold text-lg tracking-wide">Live Reviews</p>
              <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <Target className="w-4 h-4 text-pink-200" />
                <span className="text-pink-200 text-sm font-medium">Sort by feedback count</span>
              </div>
            </div>
            <ArrowRight className="w-6 h-6 text-purple-300/60 group-hover:text-pink-300 group-hover:translate-x-2 transition-all duration-300" />
          </div>
        </div>
      </div>

      {/* Departments Card */}
      <div 
        className={`group relative overflow-hidden cursor-pointer transition-all duration-700 transform hover:scale-105 hover:-rotate-1 ${
          activeStatsCard === 'departments' ? 'scale-105 shadow-2xl ring-4 ring-purple-500/30' : ''
        }`}
        onClick={() => handleStatsCardClick('departments')}
      >
        <div className="relative bg-gradient-to-br from-indigo-900/90 via-purple-800/90 to-pink-900/90 p-8 rounded-3xl shadow-2xl border border-purple-500/30">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute bottom-0 right-0 w-28 h-28 bg-gradient-to-tl from-purple-400/10 to-transparent rounded-full blur-2xl"></div>
          
          <div className="absolute top-8 right-8 w-2 h-2 bg-purple-400/60 rounded-full animate-ping animation-delay-300"></div>
          <div className="absolute bottom-12 right-12 w-1 h-1 bg-pink-400/80 rounded-full animate-pulse animation-delay-800"></div>
          
          <div className="relative flex items-center gap-6">
            <div className="relative">
              <div className="p-5 bg-purple-500/15 backdrop-blur-sm rounded-2xl shadow-xl group-hover:scale-110 transition-transform duration-500">
                <Award className="w-10 h-10 text-purple-300 drop-shadow-lg" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-pink-400 rounded-full flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-pink-800" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-4xl font-black text-purple-300 mb-2 drop-shadow-lg">
                {departments.length}
              </h3>
              <p className="text-purple-200 font-bold text-lg tracking-wide">Departments</p>
              <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <Filter className="w-4 h-4 text-purple-200" />
                <span className="text-purple-200 text-sm font-medium">Filter by department</span>
              </div>
            </div>
            <ArrowRight className="w-6 h-6 text-purple-300/60 group-hover:text-purple-300 group-hover:translate-x-2 transition-all duration-300" />
          </div>
        </div>
      </div>
    </div>
  ));

  // GODLIKE CYBERPUNK ULTRA BACKGROUND
  const CyberpunkBackground = React.memo(() => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Base gradient with depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-purple-950 to-black"></div>
      
      {/* Animated Matrix Rain */}
      {[...Array(5)].map((_, i) => (
        <div
          key={`matrix-${i}`}
          className="absolute text-xs font-mono opacity-30 mix-blend-color-dodge"
          style={{
            left: `${15 + i * 18}%`,
            top: 0,
            color: i % 3 === 0 ? '#06b6d4' : i % 3 === 1 ? '#8b5cf6' : '#ec4899',
            textShadow: i % 3 === 0 
              ? '0 0 10px #06b6d4, 0 0 20px #06b6d4' 
              : i % 3 === 1 
                ? '0 0 10px #8b5cf6, 0 0 20px #8b5cf6' 
                : '0 0 10px #ec4899, 0 0 20px #ec4899',
            animation: `matrixRain ${4 + i}s linear infinite`,
            animationDelay: `${i * 0.5}s`,
            transform: 'translateY(-100vh)',
            letterSpacing: '0.2em',
            lineHeight: '1.2',
            WebkitTextStroke: '0.5px rgba(0,0,0,0.5)'
          }}
        >
          {Array(100).fill(0).map((_, j) => (
            <div key={j} className="whitespace-nowrap">
              {Array.from({length: 12}, () => Math.random() > 0.5 ? '█' : ['0','1','▓','▒','░','◧','◨','◈','◇','◈'][Math.floor(Math.random() * 10)]).join(' ')}
            </div>
          ))}
        </div>
      ))}

      {/* Floating Cyber Orbs with Trails */}
      {[...Array(12)].map((_, i) => (
        <div
          key={`orb-${i}`}
          className="absolute w-2 h-2 rounded-full opacity-80 filter blur-sm"
          style={{
            backgroundColor: i % 4 === 0 ? '#06b6d4' : i % 4 === 1 ? '#8b5cf6' : i % 4 === 2 ? '#ec4899' : '#fbbf24',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `floatOrb ${8 + Math.random() * 10}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
            boxShadow: `0 0 ${15 + Math.random() * 20}px ${
              i % 4 === 0 ? '#06b6d4' : i % 4 === 1 ? '#8b5cf6' : i % 4 === 2 ? '#ec4899' : '#fbbf24'
            }`,
            zIndex: 1
          }}
        >
          <div 
            className="absolute inset-0 rounded-full animate-ping"
            style={{
              boxShadow: `0 0 ${20 + Math.random() * 15}px ${
                i % 4 === 0 ? '#06b6d480' : i % 4 === 1 ? '#8b5cf680' : i % 4 === 2 ? '#ec489980' : '#fbbf2480'
              }`
            }}
          ></div>
        </div>
      ))}

      {/* Holographic Grid Pulse from Corners */}
      <div className="absolute top-0 left-0 w-96 h-96 border border-cyan-500/30 rounded-full animate-ping animation-delay-1000"></div>
      <div className="absolute top-0 right-0 w-96 h-96 border border-pink-500/30 rounded-full animate-ping animation-delay-2000"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 border border-purple-500/30 rounded-full animate-ping animation-delay-3000"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 border border-yellow-500/30 rounded-full animate-ping animation-delay-4000"></div>

      {/* Scan Beams */}
      <div 
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-40"
        style={{
          top: '30%',
          animation: 'scanBeam 6s ease-in-out infinite',
          boxShadow: '0 0 30px #06b6d4, 0 0 60px #06b6d4',
          zIndex: 2
        }}
      ></div>
      <div 
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-400 to-transparent opacity-40"
        style={{
          top: '70%',
          animation: 'scanBeam 8s ease-in-out infinite',
          animationDelay: '2s',
          boxShadow: '0 0 30px #ec4899, 0 0 60px #ec4899',
          zIndex: 2
        }}
      ></div>

      {/* Radar Pulse Circles */}
      <div 
        className="absolute top-1/2 left-1/2 w-96 h-96 border border-cyan-500/20 rounded-full opacity-30"
        style={{
          transform: 'translate(-50%, -50%)',
          animation: 'radarPulse 4s ease-out infinite',
          boxShadow: '0 0 40px #06b6d4',
          zIndex: 1
        }}
      ></div>
      <div 
        className="absolute top-1/2 left-1/2 w-64 h-64 border border-pink-500/20 rounded-full opacity-30"
        style={{
          transform: 'translate(-50%, -50%)',
          animation: 'radarPulse 3s ease-out infinite',
          animationDelay: '1s',
          boxShadow: '0 0 30px #ec4899',
          zIndex: 1
        }}
      ></div>

      {/* Data Vortex Spiral (Subtle) */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          background: `
            radial-gradient(circle at 30% 70%, transparent 0%, #06b6d4 100%),
            radial-gradient(circle at 70% 30%, transparent 0%, #8b5cf6 100%)
          `,
          animation: 'vortexRotate 20s linear infinite',
          mixBlendMode: 'screen',
          zIndex: 0
        }}
      ></div>

      {/* Glitch Lines (Occasional) */}
      <div 
        className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 opacity-0"
        style={{
          top: '25%',
          animation: 'glitchLine 8s steps(1) infinite',
          zIndex: 3
        }}
      ></div>
      <div 
        className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 opacity-0"
        style={{
          top: '75%',
          animation: 'glitchLine 12s steps(1) infinite',
          animationDelay: '3s',
          zIndex: 3
        }}
      ></div>

      {/* DIGITAL GHOSTS — flickering hacker silhouettes */}
      <div 
        className="absolute top-1/4 left-1/4 w-12 h-20 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%2306b6d4' d='M12,2C13.1,2,14,2.9,14,4c0,1.1-0.9,2-2,2s-2-0.9-2-2C10,2.9,10.9,2,12,2 M18.5,6.5c0,1.1-0.9,2-2,2s-2-0.9-2-2c0-1.1,0.9-2,2-2S18.5,5.4,18.5,6.5z M5.5,6.5C5.5,5.4,6.4,4.5,7.5,4.5S9.5,5.4,9.5,6.5S8.6,8.5,7.5,8.5S5.5,7.6,5.5,6.5z M12,9c1.7,0,3,1.3,3,3s-1.3,3-3,3s-3-1.3-3-3S10.3,9,12,9 M12,15c1.7,0,3,1.3,3,3s-1.3,3-3,3s-3-1.3-3-3S10.3,15,12,15 M12,20c1.7,0,3,1.3,3,3s-1.3,3-3,3s-3-1.3-3-3S10.3,20,12,20'/%3E%3C/svg%3E")`,
          backgroundSize: 'cover',
          animation: 'ghostFlicker 3s infinite',
          filter: 'blur(1px)',
          zIndex: 1
        }}
      ></div>
      <div 
        className="absolute bottom-1/3 right-1/5 w-10 h-16 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23ec4899' d='M12,2C13.1,2,14,2.9,14,4c0,1.1-0.9,2-2,2s-2-0.9-2-2C10,2.9,10.9,2,12,2 M18.5,6.5c0,1.1-0.9,2-2,2s-2-0.9-2-2c0-1.1,0.9-2,2-2S18.5,5.4,18.5,6.5z M5.5,6.5C5.5,5.4,6.4,4.5,7.5,4.5S9.5,5.4,9.5,6.5S8.6,8.5,7.5,8.5S5.5,7.6,5.5,6.5z M12,9c1.7,0,3,1.3,3,3s-1.3,3-3,3s-3-1.3-3-3S10.3,9,12,9 M12,15c1.7,0,3,1.3,3,3s-1.3,3-3,3s-3-1.3-3-3S10.3,15,12,15 M12,20c1.7,0,3,1.3,3,3s-1.3,3-3,3s-3-1.3-3-3S10.3,20,12,20'/%3E%3C/svg%3E")`,
          backgroundSize: 'cover',
          animation: 'ghostFlicker 4s infinite',
          animationDelay: '1s',
          filter: 'blur(1px)',
          zIndex: 1
        }}
      ></div>

      {/* PARTICLE EXPLOSIONS — random bursts */}
      {[...Array(4)].map((_, i) => (
        <div
          key={`burst-${i}`}
          className="absolute w-0 h-0 opacity-70"
          style={{
            left: `${20 + i * 20}%`,
            top: `${30 + (i * 15) % 40}%`,
            animation: `particleBurst ${5 + i * 2}s ease-out infinite`,
            animationDelay: `${i * 3}s`,
            boxShadow: `0 0 0 0 ${i % 2 === 0 ? '#06b6d4' : '#ec4899'}`,
            zIndex: 2
          }}
        ></div>
      ))}

      {/* AI SCANNING HEX GRID OVERLAY */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle, transparent 40%, rgba(139, 92, 246, 0.3) 100%),
            repeating-linear-gradient(30deg, transparent, transparent 20px, rgba(6, 182, 212, 0.1) 20px, rgba(6, 182, 212, 0.1) 40px),
            repeating-linear-gradient(-30deg, transparent, transparent 20px, rgba(236, 72, 153, 0.1) 20px, rgba(236, 72, 153, 0.1) 40px)
          `,
          animation: 'aiScanPulse 8s ease-in-out infinite',
          zIndex: 0
        }}
      ></div>
    </div>
  ));

  // Home View
  const HomeView = () => (
    <div className="space-y-8 relative z-10">
      {/* Header */}
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="relative">
            <Shield className="w-16 h-16 text-cyan-500 drop-shadow-2xl animate-pulse" />
            <div className="absolute inset-0 w-16 h-16 bg-cyan-500/30 rounded-full blur-2xl animate-ping"></div>
          </div>
          <h1 className="text-6xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-2xl" style={{fontFamily: 'Orbitron, monospace', letterSpacing: '0.05em'}}>
            FeedbackForge
          </h1>
        </div>
        <p className="text-2xl text-cyan-100 max-w-4xl mx-auto leading-relaxed font-light">
          Experience the future of anonymous feedback at 
          <span className="font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"> Chennai Institute of Technology</span>
        </p>
        {anonymousId && (
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border-2 border-purple-500/50 p-4 rounded-2xl backdrop-blur-sm shadow-2xl">
            <div className="w-4 h-4 bg-emerald-400 rounded-full animate-pulse"></div>
            <User className="w-6 h-6 text-cyan-300" />
            <span className="text-cyan-200 font-bold text-lg">
              Authenticated as: <span className="font-black text-cyan-300">{anonymousId}</span>
            </span>
          </div>
        )}
      </div>

      <StatsCards />

      {/* Search and Filters Section */}
      <div className="bg-gray-900/90 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl border border-purple-500/30 mb-8">
        <div className="flex flex-col lg:flex-row gap-6 items-center">
          {showSearch && (
            <div className="relative flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search faculty, department, or subject..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-12 pr-10 py-4 border-2 border-purple-500/30 rounded-2xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 bg-gray-800/90 backdrop-blur-sm font-medium shadow-lg transition-all duration-300 text-cyan-100 placeholder-gray-400"
                  autoComplete="off"
                  spellCheck={false}
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-700 rounded-full transition-colors duration-200"
                    type="button"
                  >
                    <X className="w-4 h-4 text-purple-400" />
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <label className="text-sm font-bold text-cyan-300">Department:</label>
            <select
              value={filterDepartment}
              onChange={handleDepartmentChange}
              className="px-6 py-3 border-2 border-purple-500/30 rounded-xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 bg-gray-800/90 backdrop-blur-sm font-medium shadow-lg transition-all duration-300 text-cyan-100"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl shadow-lg">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <label className="text-sm font-bold text-cyan-300">Sort by:</label>
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="px-6 py-3 border-2 border-purple-500/30 rounded-xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 bg-gray-800/90 backdrop-blur-sm font-medium shadow-lg transition-all duration-300 text-cyan-100"
            >
              <option value="name">Name</option>
              <option value="rating">Average Rating</option>
              <option value="feedbacks">Feedback Count</option>
            </select>
          </div>

          {(searchQuery || filterDepartment !== 'all' || activeStatsCard) && (
            <button
              onClick={clearAllFilters}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              type="button"
            >
              Clear All
            </button>
          )}
        </div>

        {(searchQuery || filterDepartment !== 'all' || activeStatsCard) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {searchQuery && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-900/50 text-cyan-200 rounded-full text-sm font-medium">
                Search: "{searchQuery}"
                <button onClick={removeSearchFilter} type="button">
                  <X className="w-3 h-3 cursor-pointer hover:text-cyan-400" />
                </button>
              </span>
            )}
            {filterDepartment !== 'all' && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-900/50 text-purple-200 rounded-full text-sm font-medium">
                Department: {filterDepartment}
                <button onClick={removeDepartmentFilter} type="button">
                  <X className="w-3 h-3 cursor-pointer hover:text-purple-400" />
                </button>
              </span>
            )}
            {activeStatsCard && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-pink-900/50 text-pink-200 rounded-full text-sm font-medium">
                Focus: {activeStatsCard}
                <button onClick={removeActiveStatsFilter} type="button">
                  <X className="w-3 h-3 cursor-pointer hover:text-pink-400" />
                </button>
              </span>
            )}
          </div>
        )}

        <div className="mt-4 text-center">
          <p className="text-cyan-300 font-medium">
            Showing <span className="font-bold text-cyan-400">{filteredAndSortedTeachers.length}</span> of <span className="font-bold">{teachers.length}</span> faculty members
          </p>
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredAndSortedTeachers.map((teacher, index) => {
          const avgRating = calculateAverageRating(teacher.id);
          const feedbackCount = getFeedbackCount(teacher.id);
          
          return (
            <div
              key={teacher.id}
              className="group relative bg-gray-900/95 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl hover:shadow-3xl border border-purple-500/30 cursor-pointer transition-all duration-500 hover:-translate-y-3 hover:rotate-1"
              onClick={() => {
                setSelectedTeacher(teacher);
                setCurrentView('feedback');
              }}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-cyan-200 group-hover:text-cyan-300 transition-colors duration-300">
                    {teacher.name}
                  </h3>
                  <p className="text-sm font-semibold text-purple-300 uppercase tracking-wider">
                    {teacher.department}
                  </p>
                  <p className="text-base font-medium text-cyan-300 bg-purple-900/50 px-3 py-1 rounded-full inline-block">
                    {teacher.subject}
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <StarRating value={parseFloat(avgRating)} readOnly size="sm" />
                    {parseFloat(avgRating) > 0 && (
                      <span className="px-3 py-1 bg-yellow-900/50 text-yellow-300 text-xs font-bold rounded-full">
                        TOP RATED
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-cyan-300 font-medium">
                      {feedbackCount} review{feedbackCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                
                <button className="w-full mt-6 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold py-4 px-6 rounded-2xl hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                  <span className="flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" />
                    Share Feedback
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAndSortedTeachers.length === 0 && (
        <div className="text-center py-16 space-y-4">
          <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto">
            <Search className="w-12 h-12 text-purple-400" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-cyan-300">No Faculty Found</h3>
            <p className="text-purple-300 font-medium">Try adjusting your search or filters</p>
          </div>
        </div>
      )}
    </div>
  );

  // NUCLEAR FIXED: FeedbackView without React.memo - NO MORE REMOUNTING
  const FeedbackView = () => (
    <div className="max-w-6xl mx-auto space-y-8 relative z-10">
      <button
        onClick={() => setCurrentView('home')}
        className="group flex items-center gap-3 text-cyan-400 hover:text-cyan-300 font-semibold mb-8 transition-all duration-300 hover:translate-x-2"
      >
        <div className="p-2 rounded-xl bg-purple-900/50 group-hover:bg-purple-800/50 transition-colors duration-300">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </div>
        Back to Faculty
      </button>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* NUCLEAR FIXED: Feedback Form with isolated textarea component */}
        <div className="bg-gray-900/90 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-purple-500/30">
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-black bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Rate & Review
              </h2>
              {selectedTeacher && (
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-cyan-200">{selectedTeacher.name}</h3>
                  <p className="text-purple-300 font-medium">{selectedTeacher.department}</p>
                  <p className="text-cyan-300 font-semibold bg-purple-900/50 px-4 py-2 rounded-full inline-block">
                    {selectedTeacher.subject}
                  </p>
                </div>
              )}
              {anonymousId && (
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-cyan-300 bg-purple-900/50 p-3 rounded-xl">
                  <User className="w-4 h-4" />
                  <span>Reviewing as: <strong>{anonymousId}</strong></span>
                </div>
              )}
            </div>

            {/* Rating Section */}
            <div className="space-y-2">
              <label className="block text-lg font-bold text-cyan-300">
                Your Rating
              </label>
              <div className="flex justify-center p-4 bg-gray-800/50 rounded-2xl">
                <StarRating 
                  value={feedbackRating} 
                  onChange={(rating) => setFeedbackRating(rating)}
                  size="lg"
                />
              </div>
            </div>

            {/* NUCLEAR ISOLATED: Textarea Component */}
            <FeedbackTextarea />

            <button
              onClick={submitFeedback}
              disabled={!feedbackText.trim() || feedbackRating === 0}
              className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold py-4 px-8 rounded-2xl hover:shadow-xl disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
            >
              <span className="flex items-center justify-center gap-3">
                <Send className="w-5 h-5" />
                Submit Review
              </span>
            </button>
          </div>
        </div>

        {/* Live Feedback Display */}
        <div className="bg-gray-900/90 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-purple-500/30">
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                Live Reviews
              </h2>
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-black text-cyan-200">
                    {selectedTeacher ? calculateAverageRating(selectedTeacher.id) || '0.0' : '0.0'}
                  </div>
                  <div className="text-sm text-purple-300 font-medium">Average Rating</div>
                </div>
                <div className="w-px h-12 bg-purple-500/30"></div>
                <div className="text-center">
                  <div className="text-2xl font-black text-cyan-200">
                    {selectedTeacher ? getFeedbackCount(selectedTeacher.id) : 0}
                  </div>
                  <div className="text-sm text-purple-300 font-medium">Total Reviews</div>
                </div>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-4 pr-2" style={{ scrollbarWidth: 'thin' }}>
              {selectedTeacher && feedbackData[selectedTeacher.id] && feedbackData[selectedTeacher.id].length > 0 ? (
                [...feedbackData[selectedTeacher.id]].reverse().map((fb) => (
                  <div key={fb.id} className="group bg-gradient-to-br from-gray-800/50 to-purple-900/20 p-6 rounded-2xl border border-purple-500/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                        {fb.anonymousId.split(' ')[1]}
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-cyan-200">{fb.anonymousId}</span>
                          <div className="flex items-center gap-2 text-xs text-purple-300">
                            <Clock className="w-3 h-3" />
                            {timeAgo(fb.timestamp)}
                          </div>
                        </div>
                        <StarRating value={fb.rating} readOnly size="sm" />
                        <p className="text-cyan-100 leading-relaxed font-medium">{fb.comment}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto">
                    <MessageSquare className="w-8 h-8 text-purple-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-cyan-300">No Reviews Yet</h3>
                    <p className="text-purple-300 font-medium">Be the first to share your experience!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const SuccessView = () => (
    <div className="max-w-lg mx-auto text-center space-y-8 relative z-10">
      <div className="relative">
        <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-bounce">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="absolute inset-0 w-24 h-24 bg-cyan-400/30 rounded-full blur-xl mx-auto animate-ping"></div>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
          Review Submitted!
        </h2>
        <p className="text-xl text-cyan-100 leading-relaxed font-medium">
          Your anonymous feedback is now live and helping improve education quality at Chennai Institute of Technology.
        </p>
      </div>

      <button
        onClick={() => setCurrentView('home')}
        className="bg-gradient-to-r from-cyan-600 to-emerald-600 text-white font-bold py-4 px-12 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-105"
      >
        <span className="flex items-center justify-center gap-3">
          <Send className="w-5 h-5" />
          Submit More Reviews
        </span>
      </button>
    </div>
  );

  const renderView = () => {
    switch (currentView) {
      case 'feedback':
        return <FeedbackView />;
      case 'success':
        return <SuccessView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/80 to-gray-900 relative overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        @keyframes floatParticle {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.8; }
        }
        
        @keyframes floatOrb {
          0%, 100% { 
            transform: translate(0, 0) scale(1); 
            opacity: 0.6; 
          }
          25% { 
            transform: translate(20px, -30px) scale(1.2); 
            opacity: 0.9; 
          }
          50% { 
            transform: translate(5px, 20px) scale(0.9); 
            opacity: 0.7; 
          }
          75% { 
            transform: translate(-25px, -10px) scale(1.1); 
            opacity: 0.8; 
          }
        }
        
        @keyframes scanBeam {
          0%, 100% { transform: translateX(-100vw); opacity: 0.2; }
          50% { transform: translateX(100vw); opacity: 0.6; }
        }
        
        @keyframes radarPulse {
          0% { 
            transform: translate(-50%, -50%) scale(0.8); 
            opacity: 0.4; 
            box-shadow: 0 0 20px #06b6d4; 
          }
          50% { 
            transform: translate(-50%, -50%) scale(1.2); 
            opacity: 0.1; 
            box-shadow: 0 0 60px #06b6d4; 
          }
          100% { 
            transform: translate(-50%, -50%) scale(0.8); 
            opacity: 0.4; 
            box-shadow: 0 0 20px #06b6d4; 
          }
        }
        
        @keyframes vortexRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes glitchLine {
          0%, 98%, 100% { opacity: 0; }
          99% { opacity: 1; }
        }
        
        @keyframes ghostFlicker {
          0%, 100% { opacity: 0.05; transform: scale(1); }
          50% { opacity: 0.15; transform: scale(1.05) rotate(2deg); }
          25%, 75% { opacity: 0.02; transform: scale(0.95); }
        }
        
        @keyframes particleBurst {
          0% { 
            width: 0; 
            height: 0; 
            opacity: 0.8; 
            box-shadow: 0 0 0 0 #06b6d4; 
          }
          50% { 
            width: 100px; 
            height: 100px; 
            opacity: 0; 
            box-shadow: 0 0 0 40px #06b6d4; 
          }
          100% { 
            width: 0; 
            height: 0; 
            opacity: 0; 
            box-shadow: 0 0 0 80px #06b6d400; 
          }
        }
        
        @keyframes aiScanPulse {
          0%, 100% { opacity: 0.03; transform: scale(1); }
          50% { opacity: 0.08; transform: scale(1.02); }
        }
        
        @keyframes matrixRain {
          0% { transform: translateY(-100vh); }
          100% { transform: translateY(100vh); }
        }
        
        .animation-delay-300 { animation-delay: 0.3s; }
        .animation-delay-500 { animation-delay: 0.5s; }
        .animation-delay-700 { animation-delay: 0.7s; }
        .animation-delay-800 { animation-delay: 0.8s; }
        .animation-delay-1000 { animation-delay: 1s; }
        .animation-delay-2000 { animation-delay: 2s; }
        
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #1f1f1f;
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #a855f7, #06b6d4);
          border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #9333ea, #0891b2);
        }
        
        select option {
          background-color: #1f2937;
          color: #67e8f9;
        }
      `}</style>

      <CyberpunkBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {renderView()}
      </div>
    </div>
  );
};

const Index: React.FC = () => {
  return <FeedbackApp />;
};

export default Index;