import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const VoiceSTTComponent = ({ onTasksExtracted, onRemarkAdded, leadId }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [transcriptionResult, setTranscriptionResult] = useState(null);
  const [extractedTasks, setExtractedTasks] = useState([]);
  const [mode, setMode] = useState('task'); // 'task', 'remark', 'transcribe'
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setError(null);
      
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          noiseSuppression: true,
          echoCancellation: true,
          sampleRate: 16000,
          channelCount: 1
        }
      });

      streamRef.current = stream;

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Failed to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    setIsRecording(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const processAudio = async () => {
    if (!audioBlob) return;

    setIsProcessing(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const formData = new FormData();
      formData.append('audio_file', audioBlob, 'recording.webm');
      formData.append('language', 'auto');

      let endpoint;
      let additionalData = {};

      switch (mode) {
        case 'task':
          endpoint = '/api/voice/extract-tasks';
          break;
        case 'remark':
          if (!leadId) {
            throw new Error('Lead ID is required for voice remarks');
          }
          endpoint = '/api/voice/remark';
          formData.append('lead_id', leadId);
          break;
        case 'transcribe':
          endpoint = '/api/voice/transcribe';
          break;
        default:
          throw new Error('Invalid mode selected');
      }

      const response = await axios.post(
        `${API_BASE_URL}${endpoint}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      const result = response.data;
      setTranscriptionResult(result);

      // Handle different response types
      if (mode === 'task' && result.extracted_tasks) {
        setExtractedTasks(result.extracted_tasks);
        if (onTasksExtracted) {
          onTasksExtracted(result.extracted_tasks);
        }
      }

      if (mode === 'remark' && onRemarkAdded) {
        onRemarkAdded(result);
      }

      // Show success message
      const successMessage = 
        mode === 'task' ? `Extracted ${result.extracted_tasks?.length || 0} tasks` :
        mode === 'remark' ? 'Voice remark added successfully' :
        'Audio transcribed successfully';
      
      alert(successMessage);

    } catch (error) {
      console.error('Error processing audio:', error);
      setError(error.response?.data?.detail || error.message || 'Processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const clearRecording = () => {
    setAudioBlob(null);
    setTranscriptionResult(null);
    setExtractedTasks([]);
    setRecordingTime(0);
    setError(null);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const updateTaskStatus = async (voiceTaskId, taskId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE_URL}/api/voice/tasks/${voiceTaskId}/task/${taskId}`,
        { status },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      // Update local state
      setExtractedTasks(prev => 
        prev.map(task => 
          task.id === taskId ? { ...task, status } : task
        )
      );

    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Failed to update task status');
    }
  };

  return (
    <div className="voice-stt-component bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Voice Processing</h3>
        
        {/* Mode Selection */}
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setMode('task')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              mode === 'task'
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📝 Extract Tasks
          </button>
          
          {leadId && (
            <button
              onClick={() => setMode('remark')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                mode === 'remark'
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              💭 Voice Remark
            </button>
          )}
          
          <button
            onClick={() => setMode('transcribe')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              mode === 'transcribe'
                ? 'bg-purple-100 text-purple-700 border border-purple-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🎤 Transcribe Only
          </button>
        </div>

        {/* Mode Description */}
        <div className="text-sm text-gray-600 mb-4">
          {mode === 'task' && 'Record voice input to automatically extract tasks and action items'}
          {mode === 'remark' && 'Add a voice remark to the current lead'}
          {mode === 'transcribe' && 'Convert speech to text without task extraction'}
        </div>
      </div>

      {/* Recording Controls */}
      <div className="text-center mb-6">
        {!isRecording && !audioBlob && (
          <button
            onClick={startRecording}
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
          >
            <span className="text-2xl mr-2">🎤</span>
            Start Recording
          </button>
        )}

        {isRecording && (
          <div className="space-y-4">
            <div className="inline-flex items-center px-6 py-3 bg-red-100 border border-red-300 rounded-full">
              <div className="animate-pulse w-3 h-3 bg-red-500 rounded-full mr-3"></div>
              <span className="text-red-700 font-medium">
                Recording... {formatTime(recordingTime)}
              </span>
            </div>
            
            <button
              onClick={stopRecording}
              className="block mx-auto px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Stop Recording
            </button>
          </div>
        )}

        {audioBlob && !isProcessing && (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-4">
              <div className="text-green-600">
                ✅ Recording completed ({formatTime(recordingTime)})
              </div>
            </div>
            
            <div className="flex justify-center space-x-3">
              <button
                onClick={processAudio}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Process Audio
              </button>
              
              <button
                onClick={clearRecording}
                className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Clear & Record Again
              </button>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="space-y-4">
            <div className="inline-flex items-center px-6 py-3 bg-blue-100 border border-blue-300 rounded-full">
              <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full mr-3"></div>
              <span className="text-blue-700 font-medium">
                Processing audio...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-red-500 mr-2">⚠️</span>
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Results Display */}
      {transcriptionResult && (
        <div className="border-t pt-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">Results</h4>
          
          {/* Transcription Text */}
          {transcriptionResult.transcription_text && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Transcription:</h5>
              <p className="text-gray-900">{transcriptionResult.transcription_text}</p>
              
              <div className="mt-2 text-xs text-gray-500 space-x-4">
                <span>Confidence: {Math.round((transcriptionResult.confidence || 0) * 100)}%</span>
                <span>Language: {transcriptionResult.language || 'auto'}</span>
              </div>
            </div>
          )}

          {/* Extracted Tasks */}
          {mode === 'task' && extractedTasks.length > 0 && (
            <div className="mb-6">
              <h5 className="text-sm font-medium text-gray-700 mb-3">Extracted Tasks:</h5>
              <div className="space-y-3">
                {extractedTasks.map((task) => (
                  <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`
                            px-2 py-1 text-xs rounded-full
                            ${task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                              task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'}
                          `}>
                            {task.priority}
                          </span>
                          
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            {task.category}
                          </span>
                        </div>
                        
                        <p className="text-gray-900 font-medium">{task.text}</p>
                        
                        {task.due_date && (
                          <p className="text-sm text-gray-600 mt-1">
                            📅 Due: {task.due_date}
                          </p>
                        )}
                        
                        <p className="text-xs text-gray-500 mt-1">
                          Confidence: {Math.round((task.confidence || 0) * 100)}%
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <select
                          value={task.status}
                          onChange={(e) => updateTaskStatus(transcriptionResult.id, task.id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Voice Remark Success */}
          {mode === 'remark' && transcriptionResult.lead_id && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <span className="text-green-500 mr-2">✅</span>
                <span className="text-green-700">Voice remark added to lead successfully</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Browser Compatibility Check */}
      {!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia ? (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-yellow-500 mr-2">⚠️</span>
            <span className="text-yellow-700">
              Voice recording is not supported in this browser. Please use Chrome, Firefox, or Edge.
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default VoiceSTTComponent;