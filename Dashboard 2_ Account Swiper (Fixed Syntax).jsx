import React, { useState, useEffect, useRef } from 'react';

const Dashboard2AccountProspectSwiper = () => {
  const [currentAccountIndex, setCurrentAccountIndex] = useState(0);
  const [currentProspectIndex, setCurrentProspectIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [skippedTasks, setSkippedTasks] = useState([]);
  const [researchTasks, setResearchTasks] = useState([]);
  const [streakCount, setStreakCount] = useState(7);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [showContactCard, setShowContactCard] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackReason, setFeedbackReason] = useState('');
  const [voiceListening, setVoiceListening] = useState(false);
  const cardRef = useRef(null);

  // Account data
  const accountData = [
    {
      id: '0013p00001qsbxMAAQ',
      name: 'CATIC',
      industry: 'Title Insurance',
      location: 'Multi-State',
      priority: 'HIGH',
      signalScore: 94,
      recentSignal: 'USA TODAY Top Workplaces Award',
      firmographics: {
        employees: '184',
        revenue: '$47M',
        founded: '1992',
        locations: '8 states',
        type: 'Private'
      },
      technographics: {
        crm: 'Salesforce',
        marketing: 'LinkedIn Ads, Google Ads',
        sales_engagement: 'Basic outreach tools',
        intent_data: 'Bombora (legacy)',
        website_intel: 'Limited tracking'
      },
      intentTopics: [
        { topic: 'Title Insurance Software', likelihood: 'HIGH', reason: 'Core business modernization needs' },
        { topic: 'Real Estate Technology', likelihood: 'HIGH', reason: 'Agent/lender partnership tools' },
        { topic: 'Partner Relationship Management', likelihood: 'HIGH', reason: 'Agent/lender network expansion' }
      ],
      prospects: [
        {
          id: 'contact_001',
          name: 'Nicole Pratt',
          title: 'SVP, Strategic Partnerships',
          outreachUrl: 'https://app1a.outreach.io/prospects/12345',
          warmStatus: 'warm',
          callPrep: {
            opener: 'Saw CATIC won Top Workplaces - partnership expansion must be driving growth',
            painPoints: ['Agent partnership challenges', 'Territory expansion needs', 'Lender relationship gaps'],
            questions: [
              'Are you expanding agent partnerships in new regions?',
              'How do you currently identify lenders exploring title alternatives?',
              'What data helps predict which partnerships will succeed?'
            ]
          }
        },
        {
          id: 'contact_002',
          name: 'Zachary Kammerdeiner',
          title: 'VP, Innovation & Strategy',
          outreachUrl: 'https://app1a.outreach.io/prospects/12346',
          warmStatus: 'cold',
          callPrep: {
            opener: 'Innovation in title insurance - how are you approaching digital transformation?',
            painPoints: ['Technology adoption challenges', 'Innovation pipeline gaps', 'Strategic planning needs'],
            questions: [
              'How do you track innovation opportunities in title insurance?',
              'Are you evaluating new technology partnerships?',
              'What signals indicate market expansion opportunities?'
            ]
          }
        }
      ]
    },
    {
      id: '001ABC123',
      name: 'Episode Six',
      industry: 'FinTech',
      location: 'Austin, TX',
      priority: 'HIGH',
      signalScore: 91,
      recentSignal: 'Series B Funding - $25M',
      firmographics: {
        employees: '150+',
        revenue: '$15-25M',
        founded: '2015',
        locations: 'Global',
        type: 'Private'
      },
      technographics: {
        crm: 'Salesforce, HubSpot',
        marketing: 'Marketo, LinkedIn Ads',
        sales_engagement: 'Outreach, SalesLoft',
        intent_data: 'Limited/Manual',
        website_intel: 'Google Analytics'
      },
      intentTopics: [
        { topic: 'Digital Banking Platform', likelihood: 'HIGH', reason: 'Core target customer segment' },
        { topic: 'Payment Processing API', likelihood: 'HIGH', reason: 'Direct product integration needs' },
        { topic: 'Fintech Partnership', likelihood: 'HIGH', reason: 'Business model expansion' }
      ],
      prospects: [
        {
          id: 'contact_003',
          name: 'Andrew Meere',
          title: 'VP Sales',
          outreachUrl: 'https://app1a.outreach.io/prospects/12347',
          warmStatus: 'cold',
          callPrep: {
            opener: 'Congrats on the Series B - saw you raised $25M to scale payment infrastructure',
            painPoints: ['Payment platform complexity', 'Banking partnership challenges', 'Technical integration issues'],
            questions: [
              'Are you seeing payment processing bottlenecks as you scale?',
              'How do you currently identify banks ready for digital transformation?',
              'What signals help you prioritize partnership opportunities?'
            ]
          }
        }
      ]
    }
  ];

  const [accounts, setAccounts] = useState(accountData);
  const currentAccount = accounts[currentAccountIndex];
  const currentProspect = currentAccount?.prospects[currentProspectIndex];

  // Voice recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const command = event.results[0][0].transcript.toLowerCase();
        handleVoiceCommand(command);
        setVoiceListening(false);
      };

      recognition.onerror = () => {
        setVoiceListening(false);
      };

      window.recognition = recognition;
    }
  }, []);

  const handleVoiceCommand = (command) => {
    if (command.includes('skip') || command.includes('not today')) {
      setShowFeedback(true);
    } else if (command.includes('interested') || command.includes('call now')) {
      handleSwipe('right');
    } else if (command.includes('show contact') || command.includes('contact card')) {
      setShowContactCard(true);
    } else if (command.includes('show questions') || command.includes('discovery questions')) {
      setShowQuestions(true);
    }
  };

  const startVoiceRecognition = () => {
    if (window.recognition) {
      setVoiceListening(true);
      window.recognition.start();
    }
  };

  // Touch handlers
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setStartPos({ x: touch.clientX, y: touch.clientY });
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    const deltaX = touch.clientX - startPos.x;
    const deltaY = touch.clientY - startPos.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    const threshold = 100;
    if (Math.abs(dragOffset.x) > threshold || Math.abs(dragOffset.y) > threshold) {
      if (Math.abs(dragOffset.x) > Math.abs(dragOffset.y)) {
        if (dragOffset.x > 0) {
          handleSwipe('right');
        } else {
          setShowFeedback(true);
        }
      } else {
        handleSwipe(dragOffset.y > 0 ? 'down' : 'up');
      }
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const handleSwipe = (direction) => {
    switch (direction) {
      case 'right':
        setCompletedTasks(prev => [...prev, currentProspect]);
        nextProspect();
        break;
      case 'up':
        setResearchTasks(prev => [...prev, currentProspect]);
        setShowContactCard(true);
        break;
      case 'down':
        setCompletedTasks(prev => [...prev, currentProspect]);
        setStreakCount(prev => prev + 1);
        nextProspect();
        break;
    }

    setSwipeDirection(direction);
    setTimeout(() => {
      setSwipeDirection(null);
      setDragOffset({ x: 0, y: 0 });
    }, 300);
  };

  const handleSkipWithFeedback = (reason) => {
    const feedback = {
      contact_id: currentProspect.id,
      account_id: currentAccount.id,
      action: 'skip',
      reason: reason,
      timestamp: new Date().toISOString()
    };
    
    setSkippedTasks(prev => [...prev, { ...currentProspect, feedback }]);
    setShowFeedback(false);
    setFeedbackReason('');
    nextProspect();
  };

  const nextProspect = () => {
    if (currentProspectIndex < currentAccount.prospects.length - 1) {
      setCurrentProspectIndex(prev => prev + 1);
    } else if (currentAccountIndex < accounts.length - 1) {
      setCurrentAccountIndex(prev => prev + 1);
      setCurrentProspectIndex(0);
    } else {
      setCurrentAccountIndex(0);
      setCurrentProspectIndex(0);
    }
  };

  const getSignalColor = (score) => {
    if (score >= 94) return '#28A745';
    if (score >= 87) return '#457B9D';
    return '#E63946';
  };

  const getSwipeColor = () => {
    const threshold = 100;
    if (Math.abs(dragOffset.x) > threshold) {
      return dragOffset.x > 0 ? '#28A745' : '#E63946';
    }
    if (Math.abs(dragOffset.y) > threshold) {
      return dragOffset.y > 0 ? '#6C757D' : '#457B9D';
    }
    return 'transparent';
  };

  const getSwipeText = () => {
    const threshold = 100;
    if (Math.abs(dragOffset.x) > threshold) {
      return dragOffset.x > 0 ? '✅ INTERESTED' : '❌ SKIP';
    }
    if (Math.abs(dragOffset.y) > threshold) {
      return dragOffset.y > 0 ? '✅ COMPLETE' : '👤 CONTACT';
    }
    return '';
  };

  const totalProspects = accounts.reduce((sum, account) => sum + account.prospects.length, 0);
  const completedProspects = accounts.slice(0, currentAccountIndex).reduce((sum, account) => sum + account.prospects.length, 0) + currentProspectIndex;

  return (
    <div style={{
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      background: 'linear-gradient(135deg, #2B2D42 0%, #E63946 100%)',
      minHeight: '100vh',
      color: 'white',
      padding: '15px',
      touchAction: 'pan-y'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div>
          <h1 style={{
            margin: '0',
            fontSize: '22px',
            fontWeight: 'bold',
            color: 'white'
          }}>
            FlowTL Account Swiper
          </h1>
          <p style={{
            margin: '5px 0 0 0',
            color: 'rgba(255,255,255,0.8)',
            fontSize: '11px'
          }}>
            Swipe through prospects with intelligent feedback collection
          </p>
        </div>
        <img 
          src="https://cdn.brandfolder.io/G085ERAN/at/x44t95pvt98rr46x4j7v333c/ZI_logo_light.svg" 
          alt="ZoomInfo" 
          style={{ height: '30px' }}
        />
      </div>

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '10px',
        marginBottom: '20px'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          padding: '12px',
          borderRadius: '6px',
          backdropFilter: 'blur(10px)',
          border: '2px solid #E63946',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{totalProspects - completedProspects}</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#E63946', margin: '5px 0' }}>QUEUE</div>
          <div style={{ fontSize: '9px', opacity: 0.8 }}>Remaining</div>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          padding: '12px',
          borderRadius: '6px',
          backdropFilter: 'blur(10px)',
          border: '2px solid #28A745',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{completedTasks.length}</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#28A745', margin: '5px 0' }}>DONE</div>
          <div style={{ fontSize: '9px', opacity: 0.8 }}>Completed</div>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          padding: '12px',
          borderRadius: '6px',
          backdropFilter: 'blur(10px)',
          border: '2px solid #457B9D',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{researchTasks.length}</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#457B9D', margin: '5px 0' }}>RESEARCH</div>
          <div style={{ fontSize: '9px', opacity: 0.8 }}>Deep Dive</div>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          padding: '12px',
          borderRadius: '6px',
          backdropFilter: 'blur(10px)',
          border: '2px solid #6C757D',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{skippedTasks.length}</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#6C757D', margin: '5px 0' }}>SKIP</div>
          <div style={{ fontSize: '9px', opacity: 0.8 }}>Not Today</div>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          padding: '12px',
          borderRadius: '6px',
          backdropFilter: 'blur(10px)',
          border: '2px solid #E63946',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>🔥 {streakCount}</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#E63946', margin: '5px 0' }}>STREAK</div>
          <div style={{ fontSize: '9px', opacity: 0.8 }}>Day Count</div>
        </div>
      </div>

      {/* Account Context */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '8px',
        padding: '15px',
        backdropFilter: 'blur(10px)',
        border: '2px solid ' + getSignalColor(currentAccount?.signalScore),
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{
              margin: '0 0 5px 0',
              fontSize: '16px',
              color: getSignalColor(currentAccount?.signalScore)
            }}>
              {currentAccount?.name}
            </h2>
            <div style={{ fontSize: '11px', opacity: 0.9 }}>
              {currentAccount?.industry} • Contact {currentProspectIndex + 1} of {currentAccount?.prospects.length}
            </div>
          </div>
          <div style={{
            background: getSignalColor(currentAccount?.signalScore),
            color: 'white',
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '10px',
            fontWeight: 'bold'
          }}>
            Signal: {currentAccount?.signalScore}/100
          </div>
        </div>
      </div>

      {/* Card Stack Container */}
      <div style={{
        position: 'relative',
        height: '420px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        perspective: '1000px'
      }}>
        {/* Current Prospect Card */}
        {currentProspect && (
          <div
            ref={cardRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              position: 'absolute',
              width: '320px',
              height: '400px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '20px',
              cursor: 'grab',
              transform: 'translate(' + dragOffset.x + 'px, ' + dragOffset.y + 'px) rotate(' + (dragOffset.x * 0.1) + 'deg)',
              transition: isDragging ? 'none' : 'transform 0.3s ease',
              zIndex: 20,
              backdropFilter: 'blur(10px)',
              border: '2px solid ' + (getSwipeColor() || 'rgba(255,255,255,0.3)'),
              userSelect: 'none',
              touchAction: 'none',
              overflow: 'auto'
            }}
          >
            {/* Swipe Indicator */}
            {getSwipeText() && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '20px',
                fontWeight: '800',
                color: getSwipeColor(),
                textAlign: 'center',
                pointerEvents: 'none',
                background: 'rgba(0,0,0,0.8)',
                padding: '12px 16px',
                borderRadius: '8px',
                zIndex: 30,
                border: '2px solid ' + getSwipeColor()
              }}>
                {getSwipeText()}
              </div>
            )}

            {/* Prospect Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '16px',
              height: '60px'
            }}>
              {/* Left Emoji - Contact Person */}
              <div 
                style={{
                  fontSize: '32px',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '50%',
                  background: 'rgba(69, 123, 157, 0.3)',
                  border: '2px solid #457B9D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '48px',
                  height: '48px',
                  flexShrink: 0,
                  backdropFilter: 'blur(10px)'
                }}
                onClick={() => setShowContactCard(true)}
              >
                👤
              </div>

              {/* Center Content */}
              <div style={{
                flex: 1,
                textAlign: 'center',
                padding: '0 12px'
              }}>
                <a
                  href={currentProspect.outreachUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: 'white',
                    textDecoration: 'none',
                    display: 'block',
                    lineHeight: '1.2'
                  }}
                >
                  {currentProspect.name}
                </a>
                
                <div style={{
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.8)',
                  lineHeight: '1.3',
                  marginTop: '4px'
                }}>
                  {currentProspect.title} - {currentAccount.name}
                </div>
              </div>

              {/* Right Emoji - Plus for Questions */}
              <div 
                style={{
                  fontSize: '32px',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '50%',
                  background: 'rgba(230, 57, 70, 0.3)',
                  border: '2px solid #E63946',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '48px',
                  height: '48px',
                  flexShrink: 0,
                  backdropFilter: 'blur(10px)'
                }}
                onClick={() => setShowQuestions(true)}
              >
                ➕
              </div>
            </div>

            {/* Recent Signal */}
            {currentAccount?.recentSignal && (
              <div style={{
                background: 'rgba(40, 167, 69, 0.2)',
                padding: '8px 12px',
                borderRadius: '6px',
                marginBottom: '12px',
                textAlign: 'center',
                border: '1px solid #28A745'
              }}>
                <div style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  color: '#28A745',
                  marginBottom: '2px'
                }}>
                  🔥 RECENT SIGNAL
                </div>
                <div style={{
                  fontSize: '11px',
                  color: 'white'
                }}>
                  {currentAccount.recentSignal}
                </div>
              </div>
            )}

            {/* Firmographics */}
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              padding: '10px',
              borderRadius: '6px',
              marginBottom: '10px',
              border: '2px solid rgba(255,255,255,0.2)'
            }}>
              <div style={{
                fontSize: '10px',
                fontWeight: '700',
                color: '#457B9D',
                marginBottom: '6px',
                textTransform: 'uppercase'
              }}>
                📊 COMPANY DATA
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '4px',
                fontSize: '11px',
                color: 'white'
              }}>
                <div><strong>Employees:</strong> {currentAccount.firmographics.employees}</div>
                <div><strong>Revenue:</strong> {currentAccount.firmographics.revenue}</div>
                <div><strong>Founded:</strong> {currentAccount.firmographics.founded}</div>
                <div><strong>Type:</strong> {currentAccount.firmographics.type}</div>
              </div>
            </div>

            {/* Technographics */}
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              padding: '10px',
              borderRadius: '6px',
              marginBottom: '10px',
              border: '2px solid rgba(255,255,255,0.2)'
            }}>
              <div style={{
                fontSize: '10px',
                fontWeight: '700',
                color: '#457B9D',
                marginBottom: '6px',
                textTransform: 'uppercase'
              }}>
                💻 TECH STACK
              </div>
              <div style={{
                fontSize: '10px',
                color: 'white',
                lineHeight: '1.3'
              }}>
                <div><strong>CRM:</strong> {currentAccount.technographics.crm}</div>
                <div><strong>Marketing:</strong> {currentAccount.technographics.marketing}</div>
                <div><strong>Sales:</strong> {currentAccount.technographics.sales_engagement}</div>
                <div><strong>Intent:</strong> {currentAccount.technographics.intent_data}</div>
              </div>
            </div>

            {/* Intent Topics */}
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              padding: '10px',
              borderRadius: '6px',
              border: '2px solid rgba(255,255,255,0.2)'
            }}>
              <div style={{
                fontSize: '10px',
                fontWeight: '700',
                color: '#457B9D',
                marginBottom: '6px',
                textTransform: 'uppercase'
              }}>
                🎯 LIKELY INTENT TOPICS
              </div>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '4px'
              }}>
                {currentAccount.intentTopics.slice(0, 3).map((topic, index) => (
                  <div
                    key={index}
                    style={{
                      background: topic.likelihood === 'HIGH' ? '#E63946' : 
                                 topic.likelihood === 'MEDIUM' ? '#457B9D' : '#28A745',
                      color: 'white',
                      padding: '3px 6px',
                      borderRadius: '8px',
                      fontSize: '9px',
                      fontWeight: '600',
                      border: '1px solid rgba(255,255,255,0.3)'
                    }}
                  >
                    {topic.topic}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      {showFeedback && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 101,
          padding: '20px'
        }}>
          <div style={{
            background: 'rgba(43, 45, 66, 0.95)',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '400px',
            width: '100%',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(255,255,255,0.2)',
            color: 'white'
          }}>
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '18px',
              fontWeight: '700',
              color: '#E63946',
              textAlign: 'center'
            }}>
              Why skip {currentProspect?.name}?
            </h3>

            <div style={{
              display: 'grid',
              gap: '10px',
              marginBottom: '20px'
            }}>
              {[
                { id: 'seniority', label: '👔 Wrong seniority level', color: '#E63946' },
                { id: 'industry', label: '🏢 Industry not a fit', color: '#457B9D' },
                { id: 'size', label: '📊 Company too small', color: '#28A745' },
                { id: 'timing', label: '⏰ Bad timing', color: '#6C757D' },
                { id: 'tech', label: '💻 Tech stack mismatch', color: '#E63946' },
                { id: 'geo', label: '🌍 Geographic issues', color: '#457B9D' }
              ].map(option => (
                <button
                  key={option.id}
                  onClick={() => handleSkipWithFeedback(option.id)}
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    color: 'white',
                    border: '2px solid ' + option.color,
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleSkipWithFeedback('general')}
              style={{
                background: '#E63946',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              SKIP & LEARN
            </button>
          </div>
        </div>
      )}

      {/* Fixed Action Buttons */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        alignItems: 'center'
      }}>
        <button
          onClick={startVoiceRecognition}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: voiceListening ? '#E63946' : 'rgba(69, 123, 157, 0.8)',
            color: 'white',
            border: '2px solid rgba(255,255,255,0.3)',
            fontSize: '20px',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)'
          }}
        >
          🎤
        </button>

        <button
          onClick={() => setShowFeedback(true)}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(230, 57, 70, 0.8)',
            color: 'white',
            border: '2px solid rgba(255,255,255,0.3)',
            fontSize: '16px',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)'
          }}
        >
          ⏭️
        </button>

        <button
          onClick={() => setShowContactCard(true)}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(69, 123, 157, 0.8)',
            color: 'white',
            border: '2px solid rgba(255,255,255,0.3)',
            fontSize: '16px',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)'
          }}
        >
          👤
        </button>
      </div>
    </div>
  );
};

export default Dashboard2AccountProspectSwiper;