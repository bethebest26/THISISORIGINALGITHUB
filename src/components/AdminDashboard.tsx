import React, { useState, useEffect } from 'react';
import { 
  Upload, FileText, Zap, Brain, Save, RefreshCw, 
  CheckCircle2, AlertTriangle, BookOpen, Tag, Plus, 
  Search, User, DollarSign, Award, ChevronRight, 
  ArrowLeft, Image, Trash2, Edit, CheckCircle, 
  ChevronDown, HelpCircle, Loader2, BarChart2, Star, Calendar
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { TAXONOMY, ALL_CATEGORIES_ORDERED, getSubCategories } from '../utils';
import { dbService, PerformanceRecord, getTierForPoints } from '../services/dbService';
import ManageCourses from './ManageCourses';
import RecentActivity from './RecentActivity';
import PendingActions from './PendingActions';

interface LocalChapterInGeneration {
  id: string;
  courseTitle: string;
  chapterTitle: string;
  status: 'Generating MCQs...' | '5 MCQs Ready ✓' | 'Needs Review';
  date: string;
}

export default function AdminDashboard() {
  // Global View Mode: 'list' or 'buyer-detail'
  const [viewMode, setViewMode] = useState<'list' | 'buyer-detail'>('list');
  const [selectedBuyer, setSelectedBuyer] = useState<PerformanceRecord | null>(null);

  // Stats Row State
  const [stats, setStats] = useState({
    totalCourses: 2,
    totalBuyers: 354,
    totalRevenue: 17346,
    totalMCQsAnswered: 1008
  });
  const [loadingStats, setLoadingStats] = useState(false);

  // Catalog/Courses State
  const [courses, setCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  // Performance Tracking State
  const [buyers, setBuyers] = useState<PerformanceRecord[]>([]);
  const [loadingBuyers, setLoadingBuyers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'name' | 'points' | 'score'>('points');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Modals visibility
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showAddChapterModal, setShowAddChapterModal] = useState(false);

  // "+ Add New Course" Form State
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [courseBanner, setCourseBanner] = useState('');
  const [coursePrice, setCoursePrice] = useState('99');
  const [courseMainCat, setCourseMainCat] = useState('');
  const [courseSubCat, setCourseSubCat] = useState('');
  const [courseDifficulty, setCourseDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [courseTime, setCourseTime] = useState(''); // Empty initially, auto-updates to "~X mins"
  const [courseStatusMsg, setCourseStatusMsg] = useState('');
  const [savingCourse, setSavingCourse] = useState(false);

  // Document uploading & parsing state
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [parsedText, setParsedText] = useState<string>('');
  const [paraphrasedText, setParaphrasedText] = useState<string>('');
  const [wordCount, setWordCount] = useState<number | null>(null);
  const [parsingState, setParsingState] = useState<'idle' | 'reading' | 'extracting' | 'paraphrasing' | 'success' | 'error' | 'manual_fallback'>('idle');
  const [parsingError, setParsingError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [extractedSections, setExtractedSections] = useState<any[]>([]);
  const [docId, setDocId] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState(0);

  // Manual chapter entry fallback state variables
  const [manualChapterTitle, setManualChapterTitle] = useState('');
  const [manualChapterContent, setManualChapterContent] = useState('');
  const [manualChapterVolume, setManualChapterVolume] = useState<1 | 2>(1);
  const [manualChapters, setManualChapters] = useState<{ title: string; content: string; volume: number }[]>([]);

  // "+ Add New Chapter" Form State
  const [chapterCourseId, setChapterCourseId] = useState('');
  const [chapterVolumeNum, setChapterVolumeNum] = useState<1 | 2>(1);
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterContent, setChapterContent] = useState('');

  // Chapter suggestion states
  const [suggestedChapters, setSuggestedChapters] = useState<Array<{volume: number, title: string, content: string}>>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);

  // Drag and Drop Handlers for Course Modal
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    await processUploadedFile(file);
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("File input change event fired. Files count:", e.target.files?.length);
    const file = e.target.files?.[0];
    if (!file) {
      console.warn("No file was found in the input change event.");
      return;
    }

    await processUploadedFile(file);
  };

  const processUploadedFile = async (file: File) => {
    console.log("Starting processUploadedFile for:", file.name, "Size:", file.size, "Type:", file.type);
    const name = file.name;
    const ext = name.substring(name.lastIndexOf('.')).toLowerCase();
    if (ext !== '.docx' && ext !== '.pdf') {
      console.error("Uploaded file has invalid extension:", ext);
      setParsingError('Invalid file type. Please upload a .docx or .pdf file.');
      setParsingState('error');
      return;
    }

    setUploadedFileName(name);
    if (!courseTitle || !courseTitle.trim()) {
      const defaultTitle = name.substring(0, name.lastIndexOf('.'))
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
      setCourseTitle(defaultTitle);
    }
    setParsingError(null);
    setParsingState('reading');
    console.log("Set parsing state to 'reading'. Calling /api/admin/parse-document...");

    try {
      // 1. Read file text first
      const formData = new FormData();
      formData.append('file', file);

      const parseRes = await fetch('/api/admin/parse-document', {
        method: 'POST',
        body: formData,
      });

      console.log("parse-document API response received. Status:", parseRes.status);
      if (!parseRes.ok) {
        const errorData = await parseRes.json().catch(() => ({}));
        console.error("parse-document endpoint failed with details:", errorData);
        throw new Error(errorData.error || 'Failed to extract text from file.');
      }

      const parseData = await parseRes.json();
      const rawText = parseData.text;
      console.log("Successfully extracted raw document text. Character length:", rawText?.length);

      // 2. Call extraction endpoint
      console.log("Transitioning parsing state to 'extracting' and calling /api/admin/extract-sections-list...");
      setParsingState('extracting');
      const extractRes = await fetch('/api/admin/extract-sections-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rawText, fileName: name }),
      });

      console.log("extract-sections-list API response received. Status:", extractRes.status);
      if (!extractRes.ok) {
        const errDetails = await extractRes.json().catch(() => ({}));
        console.error("extract-sections-list endpoint failed:", errDetails);
        throw new Error(errDetails.error || 'Failed to extract sections list from document.');
      }

      const extractData = await extractRes.json();
      console.log("Received response from extract-sections-list. Sections extracted:", extractData.sectionsCount);
      
      if (extractData.parsingFailed) {
        console.warn("AI section slicing failed; falling back to manual template structures.");
        setParsingState('manual_fallback');
        setParsedText(extractData.rawText);
        setParsingError('AI parsing failed. Please manually review and mark chapters.');
      } else {
        console.log("Successfully parsed and registered", extractData.sections?.length, "sections with docId:", extractData.docId);
        setExtractedSections(extractData.sections);
        setDocId(extractData.docId);
        setParsingState('success');
      }
    } catch (err: any) {
      console.error("CRITICAL: Exception caught during document parsing pipeline:", err);
      setParsingError(err.message || 'An unexpected error occurred during processing.');
      setParsingState('error');
    }
  };

  // Effect to load suggestions for Selected Course in Chapter Modal
  useEffect(() => {
    if (!chapterCourseId) {
      setSuggestedChapters([]);
      return;
    }
    const rawText = localStorage.getItem(`bethebest_course_raw_text_${chapterCourseId}`);
    if (rawText) {
      setLoadingSuggestions(true);
      setSuggestionError(null);
      setSuggestedChapters([]);
      fetch('/api/admin/suggest-chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rawText })
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to parse document structure');
          return res.json();
        })
        .then(data => {
          if (data && data.chapters) {
            setSuggestedChapters(data.chapters);
          } else {
            setSuggestedChapters([]);
          }
        })
        .catch(err => {
          console.error(err);
          setSuggestionError('Could not auto-suggest chapters from document content.');
        })
        .finally(() => {
          setLoadingSuggestions(false);
        });
    } else {
      setSuggestedChapters([]);
    }
  }, [chapterCourseId]);
  
  // AI MCQ and Image Generation State
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiGeneratedMCQs, setAiGeneratedMCQs] = useState<any[]>([]);
  const [aiGeneratedImageUrl, setAiGeneratedImageUrl] = useState('');
  const [aiFeedbackMsg, setAiFeedbackMsg] = useState('');
  const [publishingChapter, setPublishingChapter] = useState(false);

  // Recent Chapters List (including temporary ones being generated)
  const [recentChapters, setRecentChapters] = useState<LocalChapterInGeneration[]>([]);

  // Fetch Stats from backend API
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch admin stats:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch Courses
  const fetchCourses = async () => {
    setLoadingCourses(true);
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          setCourses(data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    } finally {
      setLoadingCourses(false);
    }
  };

  // Fetch Buyers Performance
  const fetchBuyers = async () => {
    setLoadingBuyers(true);
    try {
      const data = await dbService.getAdminPerformanceTracking();
      setBuyers(data || []);
    } catch (err) {
      console.error("Failed to fetch buyer tracking info:", err);
    } finally {
      setLoadingBuyers(false);
    }
  };

  // Load baseline Recent Chapters from Courses
  useEffect(() => {
    if (courses.length > 0) {
      const extracted: LocalChapterInGeneration[] = [];
      // Grab some sample chapters
      courses.slice(0, 3).forEach(c => {
        extracted.push({
          id: `sample-${c.id}`,
          courseTitle: c.title,
          chapterTitle: "Foundational Traits & Core Mindset",
          status: '5 MCQs Ready ✓',
          date: new Date(c.created_at || Date.now()).toLocaleDateString()
        });
      });
      if (extracted.length === 0) {
        extracted.push(
          {
            id: 'sample-1',
            courseTitle: "Mastery Foundations",
            chapterTitle: "Discipline, Boundaries and Decisiveness",
            status: '5 MCQs Ready ✓',
            date: "Today"
          },
          {
            id: 'sample-2',
            courseTitle: "Do's and Don'ts in 2026 to Attract Women",
            chapterTitle: "Non-Verbal High Status Communication",
            status: '5 MCQs Ready ✓',
            date: "Yesterday"
          }
        );
      }
      setRecentChapters(extracted);
    } else {
      setRecentChapters([
        {
          id: 'sample-1',
          courseTitle: "Mastery Foundations",
          chapterTitle: "Discipline, Boundaries and Decisiveness",
          status: '5 MCQs Ready ✓',
          date: "Today"
        },
        {
          id: 'sample-2',
          courseTitle: "Do's and Don'ts in 2026 to Attract Women",
          chapterTitle: "Non-Verbal High Status Communication",
          status: '5 MCQs Ready ✓',
          date: "Yesterday"
        }
      ]);
    }
  }, [courses]);

  // Initial Load
  useEffect(() => {
    fetchStats();
    fetchCourses();
    fetchBuyers();
  }, []);

  // Sorting Handler
  const handleSort = (field: 'name' | 'points' | 'score') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Process sorting & searching on Buyers
  const filteredAndSortedBuyers = buyers
    .filter(b => {
      const query = searchQuery.toLowerCase();
      return (
        b.userName.toLowerCase().includes(query) ||
        b.userEmail.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') {
        comparison = a.userName.localeCompare(b.userName);
      } else if (sortField === 'points') {
        comparison = a.totalPoints - b.totalPoints;
      } else if (sortField === 'score') {
        // Compute average score
        const aScores = Object.values(a.mcqPerformance);
        const bScores = Object.values(b.mcqPerformance);
        const aAvg = aScores.length > 0 ? ((aScores.reduce((sum: number, s: any) => sum + Number(s), 0) as number) / aScores.length) : 0;
        const bAvg = bScores.length > 0 ? ((bScores.reduce((sum: number, s: any) => sum + Number(s), 0) as number) / bScores.length) : 0;
        comparison = aAvg - bAvg;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  // Add New Course Handler
  // Add New Course Handler
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseTitle || !courseMainCat || !courseSubCat) {
      setCourseStatusMsg('Please fill in all required fields (*).');
      return;
    }

    setSavingCourse(true);
    setCourseStatusMsg('Saving new course...');

    try {
      if (supabase) {
        const newId = `c_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const banner = courseBanner || "https://images.unsplash.com/photo-1507668077129-56e32842fceb?q=80&w=800&auto=format&fit=crop";
        const priceNum = parseFloat(coursePrice) || 99;

        const { error } = await supabase
          .from('courses')
          .insert({
            id: newId,
            title: courseTitle,
            description: courseDesc,
            banner_url: banner,
            price: priceNum,
            main_category: courseMainCat,
            sub_category: courseSubCat,
            category: `${courseMainCat}, ${courseSubCat}`,
            status: 'published',
            difficulty: courseDifficulty,
            estimated_time: courseTime || '2 Hours',
            created_at: new Date().toISOString()
          });

        if (error) throw error;

        // Save raw text in localStorage for chapter extraction later
        const textToSave = paraphrasedText || parsedText;
        if (textToSave) {
          localStorage.setItem(`bethebest_course_raw_text_${newId}`, textToSave);
        }

        setCourseStatusMsg('Course successfully created!');
        fetchCourses();
        fetchStats();
        setTimeout(() => {
          setShowAddCourseModal(false);
          // Reset Form
          setCourseTitle('');
          setCourseDesc('');
          setCourseBanner('');
          setCoursePrice('99');
          setCourseMainCat('');
          setCourseSubCat('');
          setCourseStatusMsg('');
          // Reset parsing states
          setUploadedFileName(null);
          setParsedText('');
          setWordCount(null);
          setParsingState('idle');
          setParsingError(null);
        }, 1500);
      } else {
        throw new Error('Supabase integration is not fully configured.');
      }
    } catch (err: any) {
      console.error(err);
      setCourseStatusMsg(`Failed to save course: ${err.message || 'Unknown Error'}`);
    } finally {
      setSavingCourse(false);
    }
  };

  const handlePublishAllSections = async () => {
    if (!docId || extractedSections.length === 0) return;

    setIsPublishing(true);
    setPublishProgress(0);

    // 1. Publish Header (assuming course title is already set in courseTitle)
    // Actually I should probably have a way to set course title/desc/banner before this
    // Let's assume they are set.
    
    // For now, call the publish header endpoint
    try {
        const headerRes = await fetch('/api/admin/publish-course-header', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              title: courseTitle, 
              description: courseDesc, 
              bannerUrl: courseBanner,
              price: coursePrice ? Number(coursePrice) : 99,
              category: `${courseMainCat || 'Self-Mastery'}, ${courseSubCat || 'Core'}`
            })
        });

        if (!headerRes.ok) {
          const errData = await headerRes.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to create course header.");
        }

        const headerData = await headerRes.json();
        const { volume1Id, volume2Id } = headerData;

        // 2. Iterate and process
        for (let i = 0; i < extractedSections.length; i++) {
            setPublishProgress(Math.round(((i) / extractedSections.length) * 100));
            
            // a. Process
            const procRes = await fetch('/api/admin/process-single-section', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ docId, index: i })
            });

            if (!procRes.ok) {
              const errData = await procRes.json().catch(() => ({}));
              throw new Error(errData.error || `Failed to process section at index ${i}`);
            }

            const procData = await procRes.json();

            // b. Publish
            const volId = procData.volume === 1 ? volume1Id : volume2Id;
            const pubRes = await fetch('/api/admin/publish-single-chapter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    volumeId: volId, 
                    title: procData.title, 
                    traitNumber: i + 1,
                    paraphrasedContent: procData.paraphrasedContent,
                    mcqs: procData.mcqs,
                    imageUrl: procData.imageUrl
                })
            });

            if (!pubRes.ok) {
              const errData = await pubRes.json().catch(() => ({}));
              throw new Error(errData.error || `Failed to publish chapter: ${procData.title}`);
            }
        }
        setPublishProgress(100);
        setCourseStatusMsg("Course Published Successfully!");
        fetchCourses();
        setShowAddCourseModal(false);
    } catch (err: any) {
        console.error(err);
        setCourseStatusMsg(err.message || "Failed to publish course.");
        alert(err.message || "Failed to publish course.");
    } finally {
        setIsPublishing(false);
    }
  };

  const handlePublishManualCourse = async () => {
    if (manualChapters.length === 0) {
      alert("Please add at least one chapter before publishing.");
      return;
    }
    if (!courseTitle.trim()) {
      alert("Please enter a course title.");
      return;
    }

    setIsPublishing(true);
    setPublishProgress(0);

    try {
        // 1. Publish Header
        const headerRes = await fetch('/api/admin/publish-course-header', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              title: courseTitle, 
              description: courseDesc, 
              bannerUrl: courseBanner,
              price: coursePrice ? Number(coursePrice) : 99,
              category: `${courseMainCat || 'Self-Mastery'}, ${courseSubCat || 'Core'}`
            })
        });
        
        if (!headerRes.ok) {
          const errData = await headerRes.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to publish course header.");
        }
        
        const headerData = await headerRes.json();
        const { volume1Id, volume2Id } = headerData;

        // 2. Iterate and process manual chapters
        for (let i = 0; i < manualChapters.length; i++) {
            setPublishProgress(Math.round(((i) / manualChapters.length) * 100));
            const ch = manualChapters[i];
            
            // a. Process using our modified single-section processor supporting manualSection
            const procRes = await fetch('/api/admin/process-single-section', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  manualSection: {
                    title: ch.title,
                    originalContent: ch.content,
                    volume: ch.volume,
                    index: i
                  }
                })
            });
            
            if (!procRes.ok) {
              const errData = await procRes.json().catch(() => ({}));
              throw new Error(errData.error || `Failed to process manual chapter: ${ch.title}`);
            }
            
            const procData = await procRes.json();

            // b. Publish
            const volId = procData.volume === 1 ? volume1Id : volume2Id;
            const pubRes = await fetch('/api/admin/publish-single-chapter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    volumeId: volId, 
                    title: procData.title, 
                    traitNumber: i + 1,
                    paraphrasedContent: procData.paraphrasedContent,
                    mcqs: procData.mcqs,
                    imageUrl: procData.imageUrl
                })
            });
            
            if (!pubRes.ok) {
              const errData = await pubRes.json().catch(() => ({}));
              throw new Error(errData.error || `Failed to publish manual chapter: ${ch.title}`);
            }
        }
        setPublishProgress(100);
        setCourseStatusMsg("Course Published Successfully!");
        
        // Reset manual states
        setManualChapters([]);
        setManualChapterTitle('');
        setManualChapterContent('');
        
        fetchCourses();
        setTimeout(() => {
          setShowAddCourseModal(false);
          // Reset basic fields
          setCourseTitle('');
          setCourseDesc('');
          setCourseBanner('');
          setCoursePrice('99');
          setCourseMainCat('');
          setCourseSubCat('');
          setCourseStatusMsg('');
          setUploadedFileName(null);
          setParsedText('');
          setWordCount(null);
          setParsingState('idle');
          setParsingError(null);
        }, 1500);
    } catch (err: any) {
        console.error(err);
        setCourseStatusMsg(`Failed to publish course: ${err.message || 'Unknown Error'}`);
    } finally {
        setIsPublishing(false);
    }
  };

  const handleCloseAddCourseModal = () => {
    setShowAddCourseModal(false);
    setCourseTitle('');
    setCourseDesc('');
    setCourseBanner('');
    setCoursePrice('99');
    setCourseMainCat('');
    setCourseSubCat('');
    setCourseStatusMsg('');
    setUploadedFileName(null);
    setParsedText('');
    setWordCount(null);
    setParsingState('idle');
    setParsingError(null);
    setManualChapters([]);
    setManualChapterTitle('');
    setManualChapterContent('');
  };

  // Add New Chapter / Process with AI Handler
  const handleProcessChapterAI = async () => {
    if (!chapterCourseId || !chapterTitle || !chapterContent) {
      setAiFeedbackMsg('Please select a course and provide a chapter title and reading text.');
      return;
    }

    setIsProcessingAI(true);
    setAiFeedbackMsg('Contacting Gemini API...');
    
    // Add to Recent Chapters with generating status
    const tempGenId = `gen_${Date.now()}`;
    const selectedCourse = courses.find(c => c.id === chapterCourseId);
    const newRecentItem: LocalChapterInGeneration = {
      id: tempGenId,
      courseTitle: selectedCourse ? selectedCourse.title : "New Course Module",
      chapterTitle: chapterTitle,
      status: 'Generating MCQs...',
      date: 'Now'
    };
    
    setRecentChapters(prev => [newRecentItem, ...prev]);

    try {
      // 1. Generate MCQs from server endpoint
      const mcqResponse = await fetch('/api/admin/generate-mcqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterText: chapterContent })
      });

      if (!mcqResponse.ok) {
        throw new Error('Failed to generate MCQs using Gemini Flash.');
      }

      const mcqData = await mcqResponse.json();
      const generatedMCQs = mcqData.mcqs || [];

      // Map option correct values to clean formats
      const mappedMCQs = generatedMCQs.map((q: any, index: number) => ({
        id: `gen-q-${index + 1}`,
        question: q.question || `Retention Assessment Question ${index + 1}`,
        options: q.options || ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: q.correctAnswer || q.options?.[0] || "Option A",
        feedback: q.feedback || "Good attention to detail!"
      }));

      // 2. Generate AI Image
      setAiFeedbackMsg('Generating AI Concept Image...');
      const imgResponse = await fetch('/api/admin/generate-chapter-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterTitle, chapterText: chapterContent })
      });

      let imgUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop";
      if (imgResponse.ok) {
        const imgData = await imgResponse.json();
        imgUrl = imgData.imageUrl || imgUrl;
      }

      // Update State
      setAiGeneratedMCQs(mappedMCQs);
      setAiGeneratedImageUrl(imgUrl);
      setAiFeedbackMsg('AI Generation Complete! Please review materials below.');
      
      // Update Recent Chapter Status
      setRecentChapters(prev => 
        prev.map(item => item.id === tempGenId ? { ...item, status: 'Needs Review' } : item)
      );

    } catch (err: any) {
      console.error(err);
      setAiFeedbackMsg(`AI Processing Failed: ${err.message}`);
      setRecentChapters(prev => 
        prev.map(item => item.id === tempGenId ? { ...item, status: 'Needs Review' } : item)
      );
    } finally {
      setIsProcessingAI(false);
    }
  };

  // Regenerate Image option
  const handleRegenerateImage = async () => {
    setAiFeedbackMsg('Regenerating AI Image...');
    try {
      const imgResponse = await fetch('/api/admin/generate-chapter-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapterTitle, chapterText: chapterContent })
      });

      if (imgResponse.ok) {
        const imgData = await imgResponse.json();
        if (imgData.imageUrl) {
          setAiGeneratedImageUrl(imgData.imageUrl);
          setAiFeedbackMsg('AI Image regenerated successfully!');
        }
      }
    } catch (err) {
      console.error(err);
      setAiFeedbackMsg('Failed to regenerate image.');
    }
  };

  // Edit fields inline in state
  const handleEditMCQQuestion = (index: number, val: string) => {
    setAiGeneratedMCQs(prev => {
      const updated = [...prev];
      updated[index].question = val;
      return updated;
    });
  };

  const handleEditMCQOption = (qIndex: number, optIndex: number, val: string) => {
    setAiGeneratedMCQs(prev => {
      const updated = [...prev];
      updated[qIndex].options[optIndex] = val;
      return updated;
    });
  };

  const handleEditMCQCorrectAnswer = (qIndex: number, val: string) => {
    setAiGeneratedMCQs(prev => {
      const updated = [...prev];
      updated[qIndex].correctAnswer = val;
      return updated;
    });
  };

  // Publish Chapter to Supabase
  const handlePublishChapter = async () => {
    if (!chapterCourseId || !chapterTitle || !chapterContent || aiGeneratedMCQs.length === 0) {
      setAiFeedbackMsg('Missing details. Ensure MCQs are processed first.');
      return;
    }

    setPublishingChapter(true);
    setAiFeedbackMsg('Publishing chapter to Supabase...');

    try {
      if (supabase) {
        // 1. Fetch or create course_volumes for this volume index
        let { data: volumeRow, error: volumeFetchError } = await supabase
          .from('course_volumes')
          .select('*')
          .eq('course_id', chapterCourseId)
          .eq('volume_number', chapterVolumeNum)
          .maybeSingle();

        if (volumeFetchError) throw volumeFetchError;

        if (!volumeRow) {
          const { data: newVol, error: volumeCreateError } = await supabase
            .from('course_volumes')
            .insert({
              course_id: chapterCourseId,
              title: chapterVolumeNum === 1 ? 'Foundations' : 'Advanced Application',
              description: chapterVolumeNum === 1 ? 'Foundational concepts.' : 'Advanced techniques.',
              volume_number: chapterVolumeNum
            })
            .select()
            .single();

          if (volumeCreateError) throw volumeCreateError;
          volumeRow = newVol;
        }

        const volumeId = volumeRow.id;

        // Count current lessons to compute trait_number
        const { data: currentLessons } = await supabase
          .from('lessons')
          .select('id')
          .eq('volume_id', volumeId);
        const currentCount = currentLessons ? currentLessons.length : 0;

        // 2. Insert Lessons
        const lessonId = `l_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
        const { error: lessonError } = await supabase
          .from('lessons')
          .insert({
            id: lessonId,
            volume_id: volumeId,
            title: chapterTitle,
            trait_number: currentCount + 1,
            reading_time: '10 Minutes',
            difficulty: 'Intermediate',
            introduction: chapterContent.substring(0, 150) + "...",
            real_life_scenario: "Concept in action",
            real_life_outcome: "Positive resolution"
          });

        if (lessonError) throw lessonError;

        // 3. Insert Reading Card
        const { error: cardError } = await supabase
          .from('reading_cards')
          .insert({
            lesson_id: lessonId,
            title: chapterTitle,
            content: chapterContent,
            display_order: 1
          });

        if (cardError) throw cardError;

        // 4. Insert MCQ
        for (const q of aiGeneratedMCQs) {
          const mcqId = `q_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
          const { error: mcqError } = await supabase
            .from('mcqs')
            .insert({
              id: mcqId,
              lesson_id: lessonId,
              question: q.question,
              options: q.options,
              correct_answer: q.correctAnswer,
              feedback: q.feedback || 'Great focus!'
            });
          if (mcqError) throw mcqError;
        }

        setAiFeedbackMsg('Chapter fully published & live for students!');
        
        // Update local Recent Chapters list status
        setRecentChapters(prev => 
          prev.map(item => item.chapterTitle === chapterTitle ? { ...item, status: '5 MCQs Ready ✓' } : item)
        );

        fetchStats();
        fetchCourses();

        setTimeout(() => {
          setShowAddChapterModal(false);
          // Reset chapter form
          setChapterCourseId('');
          setChapterVolumeNum(1);
          setChapterTitle('');
          setChapterContent('');
          setAiGeneratedMCQs([]);
          setAiGeneratedImageUrl('');
          setAiFeedbackMsg('');
        }, 1500);

      } else {
        throw new Error('Supabase integration is not connected.');
      }
    } catch (err: any) {
      console.error(err);
      setAiFeedbackMsg(`Failed to publish: ${err.message || 'Unknown Error'}`);
    } finally {
      setPublishingChapter(false);
    }
  };

  return (
    <div id="admin-dashboard-container" className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Block */}
        <div id="admin-header-panel" className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white/45 backdrop-blur-xl border border-white/50 p-6 sm:p-8 rounded-[32px] shadow-sm">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/10 text-xs font-semibold text-blue-600">
              <Brain className="w-3.5 h-3.5 animate-pulse" />
              <span>COGNITIVE COMMAND ACTIVE</span>
            </div>
            <h1 className="text-2.5xl sm:text-3xl font-display font-black text-slate-800 tracking-tight leading-none flex items-center space-x-2">
              <span>Academy Master Controller</span>
            </h1>
            <p className="text-sm text-slate-400 font-light max-w-2xl">
              Design courseware, monitor cognitive progression, trigger automatic MCQ pipelines, and audit student intelligence metrics.
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => { fetchStats(); fetchCourses(); fetchBuyers(); }}
              className="p-2.5 rounded-xl border border-slate-150 bg-white hover:bg-slate-50 text-slate-400 hover:text-blue-600 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-sm"
              title="Refresh Analytics"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {viewMode === 'list' ? (
          <>
            {/* Top Stats Row */}
            <div id="admin-stats-row" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Stat 1: Total Courses */}
              <div className="bg-white/45 border border-white/50 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-500/10 transition-all flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Courses</p>
                  <p className="text-xl sm:text-2xl font-black font-display text-slate-700 leading-none mt-1">
                    {loadingStats ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> : stats.totalCourses}
                  </p>
                </div>
              </div>

              {/* Stat 2: Total Buyers/Students */}
              <div className="bg-white/45 border border-white/50 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-500/10 transition-all flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-600">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Students Enrolled</p>
                  <p className="text-xl sm:text-2xl font-black font-display text-slate-700 leading-none mt-1">
                    {loadingStats ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> : stats.totalBuyers}
                  </p>
                </div>
              </div>

              {/* Stat 3: Total Revenue */}
              <div className="bg-white/45 border border-white/50 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-500/10 transition-all flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gross Revenue</p>
                  <p className="text-xl sm:text-2xl font-black font-display text-slate-700 leading-none mt-1">
                    {loadingStats ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> : `₹${stats.totalRevenue}`}
                  </p>
                </div>
              </div>

              {/* Stat 4: Total MCQs Answered */}
              <div className="bg-white/45 border border-white/50 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-500/10 transition-all flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">MCQs Answered</p>
                  <p className="text-xl sm:text-2xl font-black font-display text-slate-700 leading-none mt-1">
                    {loadingStats ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> : stats.totalMCQsAnswered}
                  </p>
                </div>
              </div>
            </div>

            {/* Main Action Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Upload Content / Chapters & Management */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white/45 border border-white/50 rounded-3xl p-6 shadow-sm space-y-6">
                  
                  {/* Title Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <h2 className="text-base font-bold text-slate-800">Content Forge</h2>
                    <span className="text-[10px] font-bold bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded-full uppercase">AI Pipelines</span>
                  </div>

                  {/* Actions Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setShowAddCourseModal(true)}
                      className="flex flex-col items-center justify-center p-4 bg-white hover:bg-slate-50 border border-slate-150 rounded-2xl text-slate-600 hover:text-blue-600 transition-all shadow-sm group text-center cursor-pointer"
                    >
                      <Plus className="w-5 h-5 text-slate-400 group-hover:text-blue-500 group-hover:scale-110 transition-transform mb-2" />
                      <span className="text-xs font-bold leading-none">New Course</span>
                    </button>

                    <button
                      onClick={() => setShowAddChapterModal(true)}
                      className="flex flex-col items-center justify-center p-4 bg-white hover:bg-slate-50 border border-slate-150 rounded-2xl text-slate-600 hover:text-blue-600 transition-all shadow-sm group text-center cursor-pointer"
                    >
                      <Zap className="w-5 h-5 text-slate-400 group-hover:text-yellow-500 group-hover:scale-110 transition-transform mb-2 animate-pulse" />
                      <span className="text-xs font-bold leading-none">New Chapter</span>
                    </button>
                  </div>

                  {/* Recent Chapters List */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <span>Recent Chapters</span>
                      <span>Status</span>
                    </div>

                    <div className="space-y-2 max-h-[22rem] overflow-y-auto pr-1">
                      {recentChapters.map((ch) => (
                        <div 
                          key={ch.id} 
                          className="bg-white border border-slate-100 rounded-xl p-3 shadow-[0_2px_4px_rgba(0,0,0,0.02)] flex items-start justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1 min-w-0">
                            <h4 className="font-bold text-slate-700 truncate">{ch.chapterTitle}</h4>
                            <p className="text-[10px] text-slate-400 truncate">{ch.courseTitle}</p>
                          </div>
                          
                          <span className={`shrink-0 font-bold px-2 py-0.5 rounded-md text-[9px] ${
                            ch.status === 'Generating MCQs...' 
                              ? 'bg-amber-50 text-amber-600 border border-amber-100 animate-pulse'
                              : ch.status === 'Needs Review'
                                ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                                : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          }`}>
                            {ch.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Add ManageCourses here */}
                <ManageCourses />
              </div>

              {/* Right Column: Buyer Performance */}
              <div className="lg:col-span-8 space-y-6">
                <div id="buyer-performance-card" className="bg-white/45 border border-white/50 rounded-3xl p-6 shadow-sm space-y-6">
                  
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-base font-bold text-slate-800">Student Cognition Registry</h2>
                      <p className="text-[11px] text-slate-400 font-light mt-0.5">Track real-time evaluation performance, purchased versions, global rankings and tiers.</p>
                    </div>
                    
                    <span className="text-xs bg-slate-100/80 text-slate-600 font-bold px-3 py-1 rounded-full text-center">
                      {filteredAndSortedBuyers.length} Students tracked
                    </span>
                  </div>

                  {/* Controls Row */}
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    
                    {/* Search Input */}
                    <div className="relative w-full sm:flex-1">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search student name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-white hover:border-slate-300 focus:border-blue-500 focus:outline-none transition-colors shadow-inner"
                      />
                    </div>

                    {/* Sorting Info Desktop */}
                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sort by:</span>
                      <div className="flex bg-slate-100 rounded-lg p-0.5">
                        <button
                          onClick={() => handleSort('points')}
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                            sortField === 'points' 
                              ? 'bg-white text-blue-600 shadow-sm' 
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Points
                        </button>
                        <button
                          onClick={() => handleSort('score')}
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                            sortField === 'score' 
                              ? 'bg-white text-blue-600 shadow-sm' 
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Quiz Score
                        </button>
                        <button
                          onClick={() => handleSort('name')}
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                            sortField === 'name' 
                              ? 'bg-white text-blue-600 shadow-sm' 
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Name
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Performance Table */}
                  <div className="overflow-x-auto border border-slate-100 rounded-2xl shadow-inner bg-white">
                    {loadingBuyers ? (
                      <div className="flex flex-col items-center justify-center py-16 space-y-3">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        <p className="text-xs text-slate-400 font-semibold uppercase">Mapping user cognition tracks...</p>
                      </div>
                    ) : filteredAndSortedBuyers.length === 0 ? (
                      <div className="text-center py-16 space-y-2 bg-slate-50/40">
                        <User className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="text-sm font-bold text-slate-600">No student profiles match your search.</p>
                        <p className="text-xs text-slate-400 font-light">Verify correct name spelling or criteria.</p>
                      </div>
                    ) : (
                      <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-slate-50/50">
                          <tr className="text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">
                            <th className="px-5 py-4">Student</th>
                            <th className="px-5 py-4">Versions Owned</th>
                            <th className="px-5 py-4 text-center">Avg MCQ Score</th>
                            <th className="px-5 py-4 text-center">Global Points</th>
                            <th className="px-5 py-4">Intelligence Tier</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {filteredAndSortedBuyers.map((b) => {
                            const scores = Object.values(b.mcqPerformance);
                            const avgScore = scores.length > 0 
                              ? ((scores.reduce((sum: number, s: any) => sum + Number(s), 0) as number) / scores.length).toFixed(1) 
                              : '0.0';
                            const avgPercent = scores.length > 0
                              ? Math.round(((scores.reduce((sum: number, s: any) => sum + Number(s), 0) as number) / (scores.length * 5)) * 100)
                              : 0;

                            return (
                              <tr 
                                key={b.userId}
                                onClick={() => {
                                  setSelectedBuyer(b);
                                  setViewMode('buyer-detail');
                                }}
                                className="hover:bg-blue-50/30 transition-all duration-150 cursor-pointer group"
                              >
                                <td className="px-5 py-4">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-700 font-bold flex items-center justify-center shrink-0 uppercase">
                                      {b.userName.substring(0, 2)}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{b.userName}</p>
                                      <p className="text-[10px] text-slate-400 truncate">{b.userEmail}</p>
                                    </div>
                                  </div>
                                </td>
                                
                                <td className="px-5 py-4">
                                  {b.purchasedVersions.length === 0 ? (
                                    <span className="text-[10px] text-slate-400 italic">No modules unlocked</span>
                                  ) : (
                                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                                      {b.purchasedVersions.map((v, i) => (
                                        <span key={i} className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase">
                                          {v}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </td>

                                <td className="px-5 py-4 text-center">
                                  {scores.length === 0 ? (
                                    <span className="text-[10px] text-slate-400">Not taken</span>
                                  ) : (
                                    <div className="inline-flex flex-col items-center">
                                      <span className="font-mono font-bold text-slate-700">{avgScore}/5.0</span>
                                      <span className="text-[9px] font-bold text-emerald-600">{avgPercent}% accuracy</span>
                                    </div>
                                  )}
                                </td>

                                <td className="px-5 py-4 text-center font-mono font-bold text-blue-700">
                                  {b.totalPoints} pts
                                </td>

                                <td className="px-5 py-4">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                      b.currentTier === 'Unshakable' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                      b.currentTier === 'Elevated' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' :
                                      b.currentTier === 'Sharpened' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                                      b.currentTier === 'Grounded' ? 'bg-cyan-100 text-cyan-700 border border-cyan-200' :
                                      'bg-slate-100 text-slate-500'
                                    }`}>
                                      {b.currentTier}
                                    </span>
                                    
                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
                <div className="space-y-6">
                  <RecentActivity />
                  <PendingActions />
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Drill-down Buyer Detail View */
          <div id="buyer-detail-panel" className="bg-white/45 border border-white/50 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8 animate-fade-in">
            
            {/* Header / Back Action */}
            <div className="flex items-center justify-between border-b border-slate-150 pb-6">
              <button
                onClick={() => {
                  setSelectedBuyer(null);
                  setViewMode('list');
                }}
                className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-blue-600 border border-slate-200 hover:border-blue-500/20 bg-white px-4 py-2 rounded-xl active:scale-95 transition-all cursor-pointer shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to registry</span>
              </button>

              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Focus Session</span>
                <p className="text-xs font-semibold text-emerald-600 flex items-center justify-end space-x-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-1" />
                  <span>Telemetry Live</span>
                </p>
              </div>
            </div>

            {/* Profile Brief Banner */}
            {selectedBuyer && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 border border-blue-500/10 p-6 rounded-2xl shadow-sm">
                
                {/* Visual Avatar */}
                <div className="md:col-span-3 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-150 pb-6 md:pb-0 md:pr-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/10 flex items-center justify-center text-white font-black text-2xl uppercase">
                    {selectedBuyer.userName.substring(0, 2)}
                  </div>
                  <h3 className="font-display font-black text-lg text-slate-800 tracking-tight mt-3 leading-snug">{selectedBuyer.userName}</h3>
                  <p className="text-[11px] text-slate-400 font-light mt-0.5">{selectedBuyer.userEmail}</p>
                </div>

                {/* Demographics and core variables */}
                <div className="md:col-span-9 grid grid-cols-2 sm:grid-cols-4 gap-6 self-center pl-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Demographic Age</p>
                    <p className="text-base font-bold text-slate-700 mt-1">{selectedBuyer.userAge} Years old</p>
                  </div>
                  
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact Info</p>
                    <p className="text-base font-bold text-slate-700 mt-1">{selectedBuyer.userWhatsapp}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Accumulated Score</p>
                    <p className="text-base font-bold text-slate-700 mt-1">
                      {Object.keys(selectedBuyer.mcqPerformance).length > 0
                        ? `${((Object.values(selectedBuyer.mcqPerformance).reduce((sum: number, s: any) => sum + Number(s), 0) as number) / Object.keys(selectedBuyer.mcqPerformance).length).toFixed(1)}/5.0`
                        : "No evaluations"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Intelligence Level</p>
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 mt-1 rounded text-[10px] font-bold uppercase ${
                      selectedBuyer.currentTier === 'Unshakable' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                      selectedBuyer.currentTier === 'Elevated' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' :
                      selectedBuyer.currentTier === 'Sharpened' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                      selectedBuyer.currentTier === 'Grounded' ? 'bg-cyan-100 text-cyan-700 border border-cyan-200' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      <Star className="w-3 h-3 fill-current mr-1 animate-spin" />
                      <span>{selectedBuyer.currentTier}</span>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* In-depth Analytics Matrices */}
            {selectedBuyer && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left side: completed chapters & MCQ scores */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="bg-white border border-slate-150 p-6 rounded-2xl shadow-sm space-y-4">
                    <h4 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span>Completed Lecture Blocks</span>
                    </h4>

                    {Object.keys(selectedBuyer.mcqPerformance).length === 0 ? (
                      <div className="text-center py-12 border border-dashed border-slate-150 rounded-xl bg-slate-50/50">
                        <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs text-slate-500 font-semibold">No finished evaluations detected</p>
                        <p className="text-[10px] text-slate-400 font-light">Student has not taken any interactive quizzes yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {Object.entries(selectedBuyer.mcqPerformance).map(([chapterId, score], index) => {
                          // Find course/chapter details if available, else render beautiful dynamic label
                          return (
                            <div 
                              key={chapterId} 
                              className="p-4 bg-slate-50/70 border border-slate-100 rounded-xl flex items-center justify-between gap-4"
                            >
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-blue-600 uppercase">Chapter Module {index + 1}</span>
                                <h5 className="text-xs font-bold text-slate-700">
                                  {chapterId === 'pm-b1' ? 'Discipline, Boundaries and Decisiveness' :
                                   chapterId === 'pm-b2' ? 'Non-Verbal High Status Communication' :
                                   chapterId === 'pm-b3' ? 'The Art of Seductive Mystique' :
                                   `Chapter Topic Code ${chapterId}`}
                                </h5>
                              </div>
                              
                              <div className="text-right shrink-0">
                                <span className="text-[10px] font-bold text-slate-400 uppercase block">Score</span>
                                <span className={`text-xs font-black px-2 py-0.5 rounded-md ${
                                  Number(score) >= 4 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                  Number(score) >= 3 ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                  'bg-rose-50 text-rose-600 border border-rose-100'
                                }`}>
                                  {Number(score)}/5 Correct
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side: Points chart & Tier progress */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* Tier Journey Progress bar */}
                  <div className="bg-white border border-slate-150 p-6 rounded-2xl shadow-sm space-y-4">
                    <h4 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                      <Star className="w-4 h-4 text-blue-500" />
                      <span>Next Tier Alignment Progress</span>
                    </h4>

                    {/* Progress slider representation */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-600">{selectedBuyer.currentTier}</span>
                        <span className="text-slate-400">
                          {selectedBuyer.totalPoints >= 1000 ? "Max Tier Achieved" : 
                           selectedBuyer.totalPoints >= 500 ? "Next: Unshakable (1000 pts)" :
                           selectedBuyer.totalPoints >= 250 ? "Next: Elevated (500 pts)" :
                           selectedBuyer.totalPoints >= 100 ? "Next: Sharpened (250 pts)" :
                           "Next: Grounded (100 pts)"}
                        </span>
                      </div>

                      {/* Real responsive progress slider bar */}
                      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-150">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, 
                              selectedBuyer.totalPoints >= 1000 ? 100 : 
                              selectedBuyer.totalPoints >= 500 ? (selectedBuyer.totalPoints / 1000) * 100 :
                              selectedBuyer.totalPoints >= 250 ? (selectedBuyer.totalPoints / 500) * 100 :
                              selectedBuyer.totalPoints >= 100 ? (selectedBuyer.totalPoints / 250) * 100 :
                              (selectedBuyer.totalPoints / 100) * 100
                            )}%`
                          }}
                        />
                      </div>
                      
                      <p className="text-[10px] text-slate-400 font-light leading-relaxed">
                        Student needs exactly {selectedBuyer.totalPoints >= 1000 ? 0 :
                          selectedBuyer.totalPoints >= 500 ? (1000 - selectedBuyer.totalPoints) :
                          selectedBuyer.totalPoints >= 250 ? (500 - selectedBuyer.totalPoints) :
                          selectedBuyer.totalPoints >= 100 ? (250 - selectedBuyer.totalPoints) :
                          (100 - selectedBuyer.totalPoints)
                        } more focus points to advance to the next rank tier.
                      </p>
                    </div>
                  </div>

                  {/* Points Over Time custom Bar Chart */}
                  <div className="bg-white border border-slate-150 p-6 rounded-2xl shadow-sm space-y-4">
                    <h4 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                      <BarChart2 className="w-4 h-4 text-purple-500" />
                      <span>Weekly Points Acquisition Velocity</span>
                    </h4>

                    {/* Standard elegant React + Tailwind styled vertical bar charts */}
                    <div className="h-32 flex items-end justify-between gap-3 pt-4 border-b border-slate-100">
                      {[
                        { day: "Wk 1", pts: Math.round(selectedBuyer.totalPoints * 0.1) },
                        { day: "Wk 2", pts: Math.round(selectedBuyer.totalPoints * 0.25) },
                        { day: "Wk 3", pts: Math.round(selectedBuyer.totalPoints * 0.4) },
                        { day: "Wk 4", pts: Math.round(selectedBuyer.totalPoints * 0.25) }
                      ].map((bar, i) => {
                        const pctHeight = selectedBuyer.totalPoints > 0 ? (bar.pts / selectedBuyer.totalPoints) * 100 : 10;
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center group">
                            <div className="relative w-full flex justify-center mb-1">
                              <span className="absolute -top-6 bg-slate-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                +{bar.pts} pts
                              </span>
                            </div>
                            <div 
                              className="w-full bg-gradient-to-t from-blue-500 to-purple-400 rounded-t-lg transition-all duration-700 min-h-[10px]"
                              style={{ height: `${Math.max(15, pctHeight * 0.8)}px` }}
                            />
                            <span className="text-[9px] font-bold text-slate-400 mt-2">{bar.day}</span>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-slate-400 text-center font-medium mt-1">
                      Aggregated focus velocities over the trailing 30-day block.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================== */}
        {/* MODAL 1: ADD NEW COURSE */}
        {/* ==================================== */}
        {showAddCourseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-[8px]">
            <div className="bg-white rounded-[32px] border border-slate-200/80 shadow-2xl p-6 sm:p-8 w-full max-w-lg space-y-6 overflow-y-auto max-h-[92vh]">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-display font-black text-lg text-slate-800">Add New Academy Course</h3>
                <button 
                  onClick={handleCloseAddCourseModal}
                  className="text-slate-400 hover:text-slate-600 font-bold text-xs"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleCreateCourse} className="space-y-4 text-xs">
                {/* Upload Course Content (File dropzone) */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-400 uppercase tracking-wider">Upload Course Content *</label>
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => {
                      console.log("Dropzone clicked. Triggering hidden file upload input element...");
                      document.getElementById('course-file-upload')?.click();
                    }}
                    className={`relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                      dragActive 
                        ? 'border-blue-500 bg-blue-50/50' 
                        : parsingState === 'success'
                        ? 'border-emerald-500 bg-emerald-50/20'
                        : parsingState === 'error'
                        ? 'border-rose-500 bg-rose-50/20'
                        : 'border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-slate-50/80'
                    }`}
                  >
                    {parsingState === 'idle' && (
                      <div className="space-y-2">
                        <div className="p-3 bg-blue-50 rounded-full w-max mx-auto text-blue-600">
                          <Upload className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-700 text-xs">
                            Upload or drag & drop course document
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            Word (.docx) or PDF (.pdf) files only
                          </p>
                        </div>
                      </div>
                    )}

                    {parsingState === 'reading' && (
                      <div className="space-y-3">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
                        <div>
                          <p className="font-bold text-blue-600 text-xs">Reading document...</p>
                          <p className="text-[10px] text-slate-400 mt-1">Extracting raw text contents</p>
                        </div>
                      </div>
                    )}

                    {parsingState === 'extracting' && (
                      <div className="space-y-3">
                        <Loader2 className="w-6 h-6 animate-spin text-cyan-600 mx-auto" />
                        <div>
                          <p className="font-bold text-cyan-600 text-xs">Extracting title & description...</p>
                          <p className="text-[10px] text-slate-400 mt-1">Analyzing content with Gemini AI</p>
                        </div>
                      </div>
                    )}

                    {parsingState === 'paraphrasing' && (
                      <div className="space-y-3">
                        <Loader2 className="w-6 h-6 animate-spin text-purple-600 mx-auto" />
                        <div>
                          <p className="font-bold text-purple-600 text-xs">Paraphrasing content...</p>
                          <p className="text-[10px] text-slate-400 mt-1">Rewriting for originality</p>
                        </div>
                      </div>
                    )}

                    {parsingState === 'success' && (
                      <div className="space-y-4 w-full">
                        <div className="p-2 bg-emerald-50 rounded-full w-max mx-auto text-emerald-600">
                          <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-emerald-700 text-xs">Successfully Extracted {extractedSections.length} Sections!</p>
                          <p className="text-[10px] text-slate-500 font-mono mt-1">
                            {uploadedFileName}
                          </p>
                        </div>
                        
                        <div className="mt-4 text-left border-t border-slate-200 pt-4">
                          <h4 className="text-xs font-bold text-slate-700 mb-3">Extracted Chapters for Review ({extractedSections.length} found)</h4>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {extractedSections.map((sec, idx) => (
                              <div key={idx} className="bg-white border border-slate-100 rounded-lg p-2 text-[10px] flex items-center justify-between">
                                <span className="font-semibold text-slate-700 truncate">{sec.title}</span>
                                <span className="text-slate-400 font-mono">Vol {sec.volume}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {isPublishing ? (
                          <div className="mt-4 space-y-2">
                             <div className="w-full bg-slate-200 rounded-full h-2">
                                <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${publishProgress}%` }}></div>
                             </div>
                             <p className="text-[10px] text-blue-600 font-bold text-center">Publishing: {publishProgress}% Complete...</p>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={handlePublishAllSections}
                            className="w-full mt-4 bg-blue-600 text-white font-bold py-2 px-4 rounded-xl text-xs hover:bg-blue-700 transition-all shadow-md"
                          >
                            Publish Entire Course
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setUploadedFileName(null);
                            setExtractedSections([]);
                            setParsingState('idle');
                            setParsingError(null);
                          }}
                          className="mt-2 text-[10px] text-rose-500 hover:text-rose-700 font-bold underline cursor-pointer"
                        >
                          Clear & Upload Another
                        </button>
                      </div>
                    )}

                    {parsingState === 'error' && (
                      <div className="space-y-3">
                        <div className="p-2 bg-rose-50 rounded-full w-max mx-auto text-rose-600">
                          <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-rose-700 text-xs">Parsing Failed</p>
                          <p className="text-[10px] text-rose-500 mt-1 px-4">{parsingError}</p>
                        </div>
                        <p className="text-[9px] text-slate-400 mt-1 font-bold uppercase tracking-wider">
                          You can still enter details manually below
                        </p>
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setParsingState('manual_fallback');
                            }}
                            className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition-all shadow-md inline-block cursor-pointer"
                          >
                            Skip AI parsing — enter chapters manually
                          </button>
                        </div>
                      </div>
                    )}

                    {parsingState === 'manual_fallback' && (
                      <div className="space-y-4 w-full text-left p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
                          <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">Manual Chapter Entry</span>
                          <button
                            type="button"
                            onClick={() => {
                              setManualChapters([]);
                              setParsingState('idle');
                            }}
                            className="text-[10px] text-rose-500 hover:text-rose-700 font-bold underline"
                          >
                            Reset & Try File Upload
                          </button>
                        </div>

                        {/* repeatable form */}
                        <div className="space-y-3 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">Chapter Title *</label>
                            <input
                              type="text"
                              value={manualChapterTitle}
                              onChange={(e) => setManualChapterTitle(e.target.value)}
                              placeholder="e.g. Chapter 1: Eye Contact Secrets"
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-none text-xs text-slate-800"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">Select Volume *</label>
                              <select
                                value={manualChapterVolume}
                                onChange={(e) => setManualChapterVolume(Number(e.target.value) as 1 | 2)}
                                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-none text-xs bg-white text-slate-800"
                              >
                                <option value={1}>Volume 1 (Foundations)</option>
                                <option value={2}>Volume 2 (Advanced)</option>
                              </select>
                            </div>
                            <div className="flex items-end">
                              <button
                                type="button"
                                onClick={() => {
                                  if (!manualChapterTitle.trim()) {
                                    alert("Please enter a chapter title.");
                                    return;
                                  }
                                  if (!manualChapterContent.trim()) {
                                    alert("Please enter chapter content.");
                                    return;
                                  }
                                  setManualChapters([
                                    ...manualChapters,
                                    {
                                      title: manualChapterTitle.trim(),
                                      content: manualChapterContent.trim(),
                                      volume: manualChapterVolume
                                    }
                                  ]);
                                  // Reset individual inputs
                                  setManualChapterTitle('');
                                  setManualChapterContent('');
                                }}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <span>Add Chapter</span>
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">Chapter Content *</label>
                            <textarea
                              rows={5}
                              value={manualChapterContent}
                              onChange={(e) => setManualChapterContent(e.target.value)}
                              placeholder="Type or paste the full text content for this chapter..."
                              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-none text-xs font-sans resize-y text-slate-800"
                            />
                          </div>
                        </div>

                        {/* Running list of chapters */}
                        {manualChapters.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="text-xs font-bold text-slate-700 flex items-center justify-between">
                              <span>Added Chapters ({manualChapters.length})</span>
                              <span className="text-[10px] text-slate-400 font-normal">Order of addition matters</span>
                            </h4>
                            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                              {manualChapters.map((ch, idx) => (
                                <div key={idx} className="bg-white border border-slate-200 rounded-lg p-2 text-xs flex items-center justify-between shadow-xs">
                                  <div className="truncate pr-2">
                                    <span className="font-bold text-blue-600 mr-2">#{idx + 1}</span>
                                    <span className="font-semibold text-slate-700">{ch.title}</span>
                                    <span className="ml-2 px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[9px] rounded font-mono font-bold">Vol {ch.volume}</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setManualChapters(manualChapters.filter((_, i) => i !== idx));
                                    }}
                                    className="text-[10px] text-rose-500 hover:text-rose-700 hover:underline font-bold cursor-pointer"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Publishing Progress or Action */}
                        <div className="pt-2 border-t border-slate-200 mt-2">
                          {isPublishing ? (
                            <div className="space-y-2">
                              <div className="w-full bg-slate-200 rounded-full h-2">
                                <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${publishProgress}%` }}></div>
                              </div>
                              <p className="text-[10px] text-blue-600 font-bold text-center">Publishing Manual Course: {publishProgress}% Complete...</p>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={handlePublishManualCourse}
                              disabled={manualChapters.length === 0}
                              className={`w-full py-2 px-4 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                                manualChapters.length === 0 
                                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              }`}
                            >
                              Publish Course with {manualChapters.length} Manual Chapters
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    id="course-file-upload"
                    type="file"
                    accept=".docx,.pdf"
                    onChange={handleFileInputChange}
                    onClick={(e) => {
                      console.log("File upload input clicked, stopping propagation of click to parent dropzone.");
                      e.stopPropagation();
                    }}
                    className="hidden"
                  />
                </div>

                {/* Course Title */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-400 uppercase tracking-wider">Course Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Do's and Don'ts in 2026 to Attract Women"
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none bg-slate-50"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-400 uppercase tracking-wider">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Provide a comprehensive syllabus overview..."
                    value={courseDesc}
                    onChange={(e) => setCourseDesc(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none bg-slate-50"
                  />
                </div>

                {/* Categories */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-400 uppercase tracking-wider">Main Category *</label>
                    <select
                      value={courseMainCat}
                      onChange={(e) => { setCourseMainCat(e.target.value); setCourseSubCat(''); }}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none bg-slate-50"
                    >
                      <option value="">Select Category</option>
                      {ALL_CATEGORIES_ORDERED.filter(c => c !== "All").map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-400 uppercase tracking-wider">Sub-Category *</label>
                    <select
                      value={courseSubCat}
                      onChange={(e) => setCourseSubCat(e.target.value)}
                      disabled={!courseMainCat}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none bg-slate-50 disabled:opacity-50"
                    >
                      <option value="">Select Sub</option>
                      {courseMainCat && getSubCategories(courseMainCat).map(sub => <option key={sub} value={sub}>{sub}</option>)}
                    </select>
                  </div>
                </div>

                {/* Price & Estimated Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-400 uppercase tracking-wider">Price (₹ INR)</label>
                    <input
                      type="number"
                      value={coursePrice}
                      onChange={(e) => setCoursePrice(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none bg-slate-50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-400 uppercase tracking-wider">Estimated Time</label>
                    <div className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-bold flex items-center justify-between">
                      <span>{courseTime || '—'}</span>
                      {courseTime && <span className="text-[9px] uppercase tracking-wider text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-black">Auto-Calc</span>}
                    </div>
                  </div>
                </div>

                {courseStatusMsg && (
                  <p className={`p-3 rounded-xl font-bold text-center ${courseStatusMsg.includes('success') ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                    {courseStatusMsg}
                  </p>
                )}

                <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleCloseAddCourseModal}
                    className="px-4 py-2.5 rounded-xl border border-slate-250 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingCourse}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold disabled:opacity-50 flex items-center space-x-1"
                  >
                    {savingCourse && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Publish Course</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================================== */}
        {/* MODAL 2: ADD NEW CHAPTER & GENERATE */}
        {/* ==================================== */}
        {showAddChapterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-[8px]">
            <div className="bg-white rounded-[32px] border border-slate-200/80 shadow-2xl p-6 sm:p-8 w-full max-w-4xl space-y-6 overflow-y-auto max-h-[92vh]">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-blue-600" />
                  <h3 className="font-display font-black text-lg text-slate-800">Add Chapter (AI Quiz Pipeline)</h3>
                </div>
                <button 
                  onClick={() => setShowAddChapterModal(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-xs"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-xs">
                
                {/* Form Input fields */}
                <div className="space-y-4">
                  {/* Course Dropdown */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-400 uppercase tracking-wider">Select Target Course *</label>
                    <select
                      value={chapterCourseId}
                      onChange={(e) => setChapterCourseId(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none bg-slate-50"
                    >
                      <option value="">Choose Course</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  </div>

                  {/* Document Auto-Suggestions Helper */}
                  {chapterCourseId && (
                    <div className="space-y-2">
                      {loadingSuggestions && (
                        <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl flex items-center space-x-3 text-blue-600">
                          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                          <span className="font-bold">✨ Gemini is analyzing the uploaded document to suggest chapters...</span>
                        </div>
                      )}

                      {suggestionError && (
                        <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 font-bold">
                          {suggestionError}
                        </div>
                      )}

                      {!loadingSuggestions && suggestedChapters.length > 0 && (
                        <div className="p-4 bg-gradient-to-br from-blue-50/60 to-cyan-50/40 border border-blue-100 rounded-2xl space-y-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">AI Suggested Chapters</span>
                            <span className="text-[10px] text-slate-400 font-medium">Select a chapter below to auto-populate the form</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto">
                            {suggestedChapters.map((chap, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => {
                                  setChapterVolumeNum(chap.volume as 1 | 2);
                                  setChapterTitle(chap.title);
                                  setChapterContent(chap.content);
                                }}
                                className="p-2.5 bg-white border border-slate-100 rounded-xl hover:border-blue-400 hover:shadow-sm text-left transition-all group cursor-pointer"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">Vol {chap.volume}</span>
                                  <span className="text-[9px] font-bold text-slate-400 group-hover:text-blue-500">Apply →</span>
                                </div>
                                <h4 className="font-bold text-slate-700 text-[11px] line-clamp-1">{chap.title}</h4>
                                <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5 font-sans leading-relaxed">{chap.content}</p>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Volume selection */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-400 uppercase tracking-wider">Volume Allocation</label>
                    <div className="flex bg-slate-100 rounded-lg p-0.5 w-max">
                      <button
                        type="button"
                        onClick={() => setChapterVolumeNum(1)}
                        className={`px-4 py-1.5 font-bold rounded-md transition-all cursor-pointer ${
                          chapterVolumeNum === 1 ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
                        }`}
                      >
                        Volume 1 (Foundations)
                      </button>
                      <button
                        type="button"
                        onClick={() => setChapterVolumeNum(2)}
                        className={`px-4 py-1.5 font-bold rounded-md transition-all cursor-pointer ${
                          chapterVolumeNum === 2 ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
                        }`}
                      >
                        Volume 2 (Advanced)
                      </button>
                    </div>
                  </div>

                  {/* Chapter Title */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-400 uppercase tracking-wider">Chapter Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Critical Decisiveness Under Fire"
                      value={chapterTitle}
                      onChange={(e) => setChapterTitle(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none bg-slate-50"
                    />
                  </div>

                  {/* Chapter Content text */}
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-400 uppercase tracking-wider">Reading Text Content *</label>
                    <textarea
                      rows={8}
                      placeholder="Write the comprehensive body text here. Gemini will scan this to produce 5 MCQs automatically..."
                      value={chapterContent}
                      onChange={(e) => setChapterContent(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none bg-slate-50 font-mono text-[11px] leading-relaxed"
                    />
                  </div>

                  {/* Process Buttons */}
                  <div className="flex space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={handleProcessChapterAI}
                      disabled={isProcessingAI || !chapterCourseId || !chapterTitle || !chapterContent}
                      className="flex-1 flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl hover:from-blue-700 hover:to-cyan-600 disabled:opacity-50 active:scale-[0.98] transition-all cursor-pointer shadow-md shadow-blue-500/10"
                    >
                      {isProcessingAI ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-yellow-300" />
                          <span>Generating MCQs & AI Image...</span>
                        </>
                      ) : (
                        <>
                          <Brain className="w-4 h-4 text-white animate-pulse" />
                          <span>Generate MCQs & AI Image</span>
                        </>
                      )}
                    </button>
                  </div>

                  {aiFeedbackMsg && (
                    <div className="p-3 bg-blue-50 border border-blue-100 text-blue-800 rounded-xl leading-relaxed">
                      {aiFeedbackMsg}
                    </div>
                  )}
                </div>

                {/* Preview/Editor Column */}
                <div className="space-y-4 border-l border-slate-100 pl-4 lg:pl-6">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-800 uppercase tracking-wider">AI Generation Preview</h4>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 uppercase font-bold">Interactive Sandbox</span>
                  </div>

                  {aiGeneratedMCQs.length === 0 ? (
                    <div className="h-full min-h-[300px] border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center p-6 bg-slate-50/50">
                      <Zap className="w-8 h-8 text-slate-300 mb-2 animate-bounce" />
                      <p className="text-slate-500 font-bold">No generated questions yet.</p>
                      <p className="text-[11px] text-slate-400 font-light mt-0.5">Fill the form on the left and trigger the pipeline.</p>
                    </div>
                  ) : (
                    <div className="space-y-5 max-h-[36rem] overflow-y-auto pr-1">
                      
                      {/* Generated Image preview */}
                      <div className="space-y-2">
                        <label className="block font-bold text-slate-400 uppercase tracking-wider">AI Generated Illustration</label>
                        <div className="relative rounded-2xl overflow-hidden border border-slate-150 aspect-video bg-slate-100 shadow-sm flex items-center justify-center">
                          <img src={aiGeneratedImageUrl} alt="AI Illustration" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={handleRegenerateImage}
                            className="absolute bottom-3 right-3 bg-slate-900/80 text-white font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1 text-[10px] hover:bg-slate-900 active:scale-95 transition-all cursor-pointer backdrop-blur-sm"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Regenerate Image</span>
                          </button>
                        </div>
                      </div>

                      {/* Editable MCQs */}
                      <div className="space-y-4 pt-2">
                        <label className="block font-bold text-slate-400 uppercase tracking-wider">Interactive MCQs (Review/Edit)</label>
                        
                        {aiGeneratedMCQs.map((q, qIndex) => (
                          <div key={q.id} className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-3 shadow-[0_2px_4px_rgba(0,0,0,0.01)]">
                            <span className="font-bold text-[10px] bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded uppercase">Question {qIndex + 1}</span>
                            
                            {/* Question statement */}
                            <input
                              type="text"
                              value={q.question}
                              onChange={(e) => handleEditMCQQuestion(qIndex, e.target.value)}
                              className="w-full px-3 py-2 border border-slate-200 focus:border-blue-500 focus:outline-none bg-white rounded-lg font-bold text-slate-700"
                            />

                            {/* Options */}
                            <div className="grid grid-cols-2 gap-2">
                              {q.options.map((opt: string, optIndex: number) => (
                                <div key={optIndex} className="space-y-0.5">
                                  <label className="text-[9px] text-slate-400 font-bold uppercase">Option {optIndex + 1}</label>
                                  <input
                                    type="text"
                                    value={opt}
                                    onChange={(e) => handleEditMCQOption(qIndex, optIndex, e.target.value)}
                                    className="w-full px-2 py-1.5 border border-slate-200 bg-white rounded focus:border-blue-500 focus:outline-none font-medium"
                                  />
                                </div>
                              ))}
                            </div>

                            {/* Correct Answer dropdown */}
                            <div className="space-y-1">
                              <label className="text-[9px] text-slate-400 font-bold uppercase block">Correct Answer Selection</label>
                              <select
                                value={q.correctAnswer}
                                onChange={(e) => handleEditMCQCorrectAnswer(qIndex, e.target.value)}
                                className="w-full px-2 py-1.5 border border-slate-200 bg-white rounded focus:border-blue-500 focus:outline-none font-bold text-blue-600"
                              >
                                {q.options.map((opt: string, i: number) => (
                                  <option key={i} value={opt}>{opt}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Publish / Finalize Chapter */}
                      <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <button
                          type="button"
                          onClick={handlePublishChapter}
                          disabled={publishingChapter}
                          className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-teal-500 transition-all cursor-pointer shadow-lg shadow-emerald-500/10 flex items-center justify-center space-x-1 text-sm"
                        >
                          {publishingChapter ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                          <span>Save & Publish Chapter Live</span>
                        </button>
                      </div>

                    </div>
                  )}

                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
