// AI Prompt Interface Resume Script

// Terminal Animation
function initTerminalAnimation() {
    const terminalBody = document.getElementById('terminalBody');
    const projectSections = terminalBody.querySelectorAll('.project-section');
    
    // Intersection Observer for terminal animations
    const terminalObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.animated) {
                entry.target.dataset.animated = 'true';
                const command = entry.target.querySelector('.terminal-command');
                if (command) {
                    typeCommand(command);
                }
            }
        });
    }, { threshold: 0.3 });
    
    projectSections.forEach(section => {
        terminalObserver.observe(section);
    });
}

function typeCommand(element) {
    const text = element.textContent;
    element.textContent = '';
    element.style.opacity = '0';
    
    setTimeout(() => {
        element.style.opacity = '1';
        element.style.transition = 'opacity 0.3s';
        let index = 0;
        const typingInterval = setInterval(() => {
            if (index < text.length) {
                element.textContent += text[index];
                index++;
            } else {
                clearInterval(typingInterval);
                // Show project info after command
                const projectInfo = element.closest('.terminal-line').nextElementSibling;
                if (projectInfo && projectInfo.classList.contains('project-info')) {
                    setTimeout(() => {
                        projectInfo.classList.add('visible');
                    }, 300);
                }
            }
        }, 30);
    }, 200);
}


// Window Minimize Functionality
let terminalMinimized = false;
let chatMinimized = false;

// Window Drag Functionality
let isDragging = false;
let currentWindow = null;
let dragOffset = { x: 0, y: 0 };
let terminalPosition = { left: '5%', top: '10%' };
let chatPosition = { right: '5%', top: '15%' };

function minimizeWindow(windowElement, dockIcon, isTerminal = true) {
    if ((isTerminal && terminalMinimized) || (!isTerminal && chatMinimized)) {
        return; // Already minimized
    }
    
    // Get window position and size
    const rect = windowElement.getBoundingClientRect();
    const dockRect = dockIcon.getBoundingClientRect();
    
    // Calculate target position (dock icon center)
    const targetX = dockRect.left + dockRect.width / 2;
    const targetY = dockRect.top + dockRect.height / 2;
    
    // Set initial transform origin
    windowElement.style.transformOrigin = `${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px`;
    
    // Add minimizing class
    windowElement.classList.add('minimizing');
    
    // Animate to dock icon
    requestAnimationFrame(() => {
        windowElement.style.left = `${targetX}px`;
        windowElement.style.top = `${targetY}px`;
        windowElement.style.transform = 'scale(0)';
        windowElement.style.opacity = '0';
    });
    
    // After animation, set minimized state
    setTimeout(() => {
        windowElement.classList.remove('minimizing');
        windowElement.classList.add('minimized');
        dockIcon.classList.add('minimized');
        
        if (isTerminal) {
            terminalMinimized = true;
        } else {
            chatMinimized = true;
        }
        
        // Trigger dock bounce
        setTimeout(() => {
            dockIcon.classList.remove('minimized');
        }, 500);
    }, 500);
}

function restoreWindow(windowElement, dockIcon, originalLeft, originalRight, originalTop, isTerminal = true) {
    if ((isTerminal && !terminalMinimized) || (!isTerminal && !chatMinimized)) {
        return; // Already restored
    }
    
    // Remove minimized class
    windowElement.classList.remove('minimized');
    
    // Get dock icon position
    const dockRect = dockIcon.getBoundingClientRect();
    const startX = dockRect.left + dockRect.width / 2;
    const startY = dockRect.top + dockRect.height / 2;
    
    // Set initial position at dock (centered on icon)
    windowElement.style.left = `${startX}px`;
    if (isTerminal) {
        windowElement.style.right = 'auto';
    } else {
        windowElement.style.right = `${window.innerWidth - startX}px`;
        windowElement.style.left = 'auto';
    }
    windowElement.style.top = `${startY}px`;
    windowElement.style.transform = 'scale(0)';
    windowElement.style.opacity = '0';
    windowElement.style.transformOrigin = 'center center';
    windowElement.style.width = '';
    windowElement.style.height = '';
    
    // Restore to stored position (or original if stored position doesn't exist)
    requestAnimationFrame(() => {
        setTimeout(() => {
            if (isTerminal) {
                const leftPos = originalLeft || terminalPosition.left;
                const topPos = originalTop || terminalPosition.top;
                windowElement.style.left = leftPos;
                windowElement.style.right = 'auto';
                windowElement.style.top = topPos;
                // Update stored position
                terminalPosition.left = leftPos;
                terminalPosition.top = topPos;
            } else {
                const rightPos = originalRight || chatPosition.right;
                const topPos = originalTop || chatPosition.top;
                windowElement.style.right = rightPos;
                windowElement.style.left = 'auto';
                windowElement.style.top = topPos;
                // Update stored position
                chatPosition.right = rightPos;
                chatPosition.top = topPos;
            }
            windowElement.style.transform = 'scale(1)';
            windowElement.style.opacity = '1';
        }, 10);
    });
    
    // Update state
    setTimeout(() => {
        if (isTerminal) {
            terminalMinimized = false;
        } else {
            chatMinimized = false;
        }
    }, 500);
}

// Window Drag Handlers
function initWindowDrag(windowElement, headerElement, isTerminal = true) {
    let startX, startY, initialLeft, initialTop, initialRight;
    
    headerElement.addEventListener('mousedown', (e) => {
        // Don't drag if clicking on controls
        if (e.target.classList.contains('control-dot') || 
            e.target.closest('.control-dot') ||
            e.target.classList.contains('icon-btn') ||
            e.target.closest('.icon-btn')) {
            return;
        }
        
        isDragging = true;
        currentWindow = windowElement;
        
        const rect = windowElement.getBoundingClientRect();
        startX = e.clientX;
        startY = e.clientY;
        
        if (isTerminal) {
            initialLeft = rect.left;
            initialTop = rect.top;
        } else {
            initialRight = window.innerWidth - rect.right;
            initialTop = rect.top;
        }
        
        windowElement.style.transition = 'none';
        document.body.style.cursor = 'grabbing';
        document.body.style.userSelect = 'none';
        
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging || currentWindow !== windowElement) return;
        
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        if (isTerminal) {
            const newLeft = initialLeft + deltaX;
            const newTop = initialTop + deltaY;
            
            // Keep window within bounds
            const maxLeft = window.innerWidth - windowElement.offsetWidth;
            const maxTop = window.innerHeight - windowElement.offsetHeight - 100; // Account for dock
            
            const boundedLeft = Math.max(0, Math.min(newLeft, maxLeft));
            const boundedTop = Math.max(0, Math.min(newTop, maxTop));
            
            windowElement.style.left = `${boundedLeft}px`;
            windowElement.style.top = `${boundedTop}px`;
            windowElement.style.right = 'auto';
            
            // Update stored position
            terminalPosition.left = `${boundedLeft}px`;
            terminalPosition.top = `${boundedTop}px`;
        } else {
            const newRight = initialRight - deltaX;
            const newTop = initialTop + deltaY;
            
            // Keep window within bounds
            const maxRight = window.innerWidth - windowElement.offsetWidth;
            const maxTop = window.innerHeight - windowElement.offsetHeight - 100; // Account for dock
            
            const boundedRight = Math.max(0, Math.min(newRight, maxRight));
            const boundedTop = Math.max(0, Math.min(newTop, maxTop));
            
            windowElement.style.right = `${boundedRight}px`;
            windowElement.style.top = `${boundedTop}px`;
            windowElement.style.left = 'auto';
            
            // Update stored position
            chatPosition.right = `${boundedRight}px`;
            chatPosition.top = `${boundedTop}px`;
        }
    });
    
    document.addEventListener('mouseup', () => {
        if (isDragging && currentWindow === windowElement) {
            isDragging = false;
            currentWindow = null;
            windowElement.style.transition = '';
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
    });
}

// Initialize minimize buttons
document.addEventListener('DOMContentLoaded', () => {
    const terminalWindow = document.getElementById('terminalWindow');
    const chatWindow = document.getElementById('chatWindow');
    const terminalMinimizeBtn = document.getElementById('terminalMinimize');
    const chatMinimizeBtn = document.getElementById('chatMinimize');
    const terminalDockIcon = document.getElementById('terminalDockIcon');
    const chatDockIcon = document.getElementById('chatDockIcon');
    
    // Initialize window dragging
    const terminalHeader = terminalWindow?.querySelector('.terminal-header');
    const chatHeader = chatWindow?.querySelector('.ai-header');
    
    if (terminalWindow && terminalHeader) {
        // Convert initial percentage positions to pixels for dragging
        const terminalRect = terminalWindow.getBoundingClientRect();
        terminalPosition.left = `${terminalRect.left}px`;
        terminalPosition.top = `${terminalRect.top}px`;
        
        initWindowDrag(terminalWindow, terminalHeader, true);
    }
    
    if (chatWindow && chatHeader) {
        // Convert initial percentage positions to pixels for dragging
        const chatRect = chatWindow.getBoundingClientRect();
        chatPosition.right = `${window.innerWidth - chatRect.right}px`;
        chatPosition.top = `${chatRect.top}px`;
        
        initWindowDrag(chatWindow, chatHeader, false);
    }
    
    // Store original positions (will be updated when windows are moved)
    let terminalOriginalLeft = terminalPosition.left;
    let terminalOriginalTop = terminalPosition.top;
    let chatOriginalRight = chatPosition.right;
    let chatOriginalTop = chatPosition.top;
    
    // Terminal minimize
    if (terminalMinimizeBtn && terminalWindow && terminalDockIcon) {
        terminalMinimizeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            minimizeWindow(terminalWindow, terminalDockIcon, true);
        });
        
        // Restore on dock icon click
        terminalDockIcon.addEventListener('click', () => {
            if (terminalMinimized) {
                // Use current stored position
                restoreWindow(terminalWindow, terminalDockIcon, terminalPosition.left, undefined, terminalPosition.top, true);
            }
        });
    }
    
    // Chat minimize
    if (chatMinimizeBtn && chatWindow && chatDockIcon) {
        chatMinimizeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            minimizeWindow(chatWindow, chatDockIcon, false);
        });
        
        // Restore on dock icon click
        chatDockIcon.addEventListener('click', () => {
            if (chatMinimized) {
                // Use current stored position
                restoreWindow(chatWindow, chatDockIcon, undefined, chatPosition.right, chatPosition.top, false);
            }
        });
    }
});

// Initialize terminal on load
window.addEventListener('load', () => {
    initTerminalAnimation();
    // Show first project info immediately
    const firstProjectInfo = document.querySelector('.project-info');
    if (firstProjectInfo) {
        firstProjectInfo.classList.add('visible');
    }
});

// App Knowledge Base
const appData = {
    about: {
        keywords: ['about', 'what', 'app', 'application', 'purpose', 'what is', 'describe', 'overview', 'this app', 'the app'],
        content: `<p><strong>About EZMoney</strong></p>
<p>TBD</p>`
    },
    features: {
        keywords: ['feature', 'features', 'functionality', 'what can', 'capabilities', 'what does', 'do', 'include', 'offer', 'provide'],
        content: `<p><strong>Key Features</strong></p>
<p>TBD</p>`
    },
    technology: {
        keywords: ['technology', 'tech', 'stack', 'built', 'framework', 'language', 'programming', 'code', 'technical', 'built with', 'uses', 'developed'],
        content: `<p><strong>Technology Stack</strong></p>
<p>TBD</p>`
    },
    release: {
        keywords: ['release', 'launch', 'when', 'date', 'available', 'coming', 'beta', 'early access', 'timeline'],
        content: `<p><strong>Release Information</strong></p>
<p>TBD</p>`
    },
    pricing: {
        keywords: ['price', 'pricing', 'cost', 'free', 'paid', 'subscription', 'purchase', 'buy', 'money'],
        content: `<p><strong>Pricing Information</strong></p>
<p>TBD</p>`
    },
    platform: {
        keywords: ['platform', 'ios', 'android', 'web', 'desktop', 'windows', 'mac', 'linux', 'mobile', 'where'],
        content: `<p><strong>Platform Availability</strong></p>
<p>TBD</p>`
    },
    contact: {
        keywords: ['contact', 'email', 'reach', 'connect', 'get in touch', 'support', 'help', 'newsletter', 'updates'],
        content: `<p><strong>Stay Connected</strong></p>
<p>TBD</p>`
    },
    beta: {
        keywords: ['beta', 'testing', 'test', 'early access', 'waitlist', 'sign up', 'join'],
        content: `<p><strong>Beta Testing & Early Access</strong></p>
<p>TBD</p>`
    }
};

// Get elements
const chatContainer = document.getElementById('chatContainer');
const messageGroups = document.querySelectorAll('.message-group');
const promptInput = document.getElementById('promptInput');
const sendBtn = document.getElementById('sendBtn');

// Auto-resize textarea
promptInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
});

// Intersection Observer for message animations
const observerOptions = {
    threshold: 0.2,
    rootMargin: '50px'
};

const messageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe all message groups (except welcome and end)
messageGroups.forEach((group, index) => {
    if (!group.classList.contains('welcome-message') && !group.classList.contains('end-message')) {
        messageObserver.observe(group);
    }
});

// Show end message when scrolled to bottom
const endMessage = document.querySelector('.end-message');
const endObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.5 });

if (endMessage) {
    endObserver.observe(endMessage);
}

// Scroll indicator
let scrollIndicator = document.createElement('div');
scrollIndicator.className = 'scroll-indicator';
scrollIndicator.textContent = 'Scroll to see more';
chatContainer.parentNode.insertBefore(scrollIndicator, chatContainer);

let lastScrollTop = 0;
window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Show/hide scroll indicator
    if (scrollTop < documentHeight - windowHeight - 100) {
        scrollIndicator.classList.add('visible');
    } else {
        scrollIndicator.classList.remove('visible');
    }
    
    lastScrollTop = scrollTop;
}, { passive: true });

// Search function to find relevant app information
function searchApp(question) {
    const lowerQuestion = question.toLowerCase();
    const matches = [];
    
    // Calculate relevance score for each topic
    Object.keys(appData).forEach(topic => {
        const data = appData[topic];
        let score = 0;
        
        // Check keyword matches
        data.keywords.forEach(keyword => {
            if (lowerQuestion.includes(keyword)) {
                score += 1;
            }
        });
        
        if (score > 0) {
            matches.push({ topic, score, content: data.content });
        }
    });
    
    // Sort by score (highest first)
    matches.sort((a, b) => b.score - a.score);
    
    // Return best match or default response
    if (matches.length > 0) {
        return matches[0].content;
    }
    
    // Default response for unmatched questions - always about the app
    return `<p>I'd be happy to help you learn more about the app! Based on your question, here's what I can tell you about:</p>
<p><strong>Available Topics:</strong></p>
<ul>
<li>What the app is about and its purpose</li>
<li>Key features and functionality</li>
<li>Technology stack and how it's built</li>
<li>Release date and timeline</li>
<li>Pricing information</li>
<li>Platform availability (iOS, Android, Web, etc.)</li>
<li>Beta testing and early access opportunities</li>
<li>Contact information and how to stay updated</li>
</ul>
<p>Try asking about any of these topics related to the app, or be more specific with your question!</p>`;
}

// Create and add a new message to the chat
function addMessage(userMessage, aiResponse, showTyping = false) {
    const messageGroup = document.createElement('div');
    messageGroup.className = 'message-group';
    messageGroup.style.opacity = '0';
    messageGroup.style.transform = 'translateY(20px)';
    
    const aiContent = showTyping 
        ? '<p class="typing-indicator">Thinking...</p>'
        : aiResponse;
    
    messageGroup.innerHTML = `
        <div class="message user-message">
            <div class="message-avatar">👤</div>
            <div class="message-content">
                <p>${userMessage}</p>
            </div>
        </div>
        <div class="message ai-message">
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                ${aiContent}
            </div>
        </div>
    `;
    
    // Insert before end message
    const endMessage = document.querySelector('.end-message');
    if (endMessage) {
        chatContainer.insertBefore(messageGroup, endMessage);
    } else {
        chatContainer.appendChild(messageGroup);
    }
    
    // Animate in
    setTimeout(() => {
        messageGroup.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        messageGroup.style.opacity = '1';
        messageGroup.style.transform = 'translateY(0)';
    }, 10);
    
    // Scroll to new message
    setTimeout(() => {
        messageGroup.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
    
    return messageGroup;
}

// Type out AI response character by character with auto-scroll
function typeAIResponse(messageGroup, aiResponse) {
    const aiContent = messageGroup.querySelector('.ai-message .message-content');
    if (!aiContent) return;
    
    // Clear content and show typing indicator
    aiContent.innerHTML = '<p class="typing-indicator">Thinking...</p>';
    
    // Wait a moment, then start typing
    setTimeout(() => {
        aiContent.innerHTML = '';
        
        // Type out the HTML content character by character
        typeHTMLContent(aiContent, aiResponse, () => {
            // Re-enable input after typing is complete
            setTimeout(() => {
                promptInput.disabled = false;
                sendBtn.disabled = false;
                promptInput.focus();
            }, 200);
        });
    }, 500);
}

// Type out HTML content character by character
function typeHTMLContent(element, htmlContent, onComplete) {
    let currentIndex = 0;
    let currentHTML = '';
    let isInTag = false;
    let scrollCounter = 0;
    
    function typeChar() {
        if (currentIndex >= htmlContent.length) {
            // Remove cursor and set final content
            element.innerHTML = htmlContent;
            // Final smooth scroll
            scrollToBottom(true);
            if (onComplete) onComplete();
            return;
        }
        
        const char = htmlContent[currentIndex];
        currentHTML += char;
        
        // Add typing cursor
        element.innerHTML = currentHTML + '<span class="typing-cursor">▊</span>';
        
        // Auto-scroll to bottom (only every few characters for performance)
        scrollCounter++;
        if (scrollCounter % 3 === 0) {
            scrollToBottom(false);
        }
        
        currentIndex++;
        
        // Variable typing speed - slightly slower for HTML tags
        if (char === '<') {
            isInTag = true;
        } else if (char === '>') {
            isInTag = false;
        }
        
        // Faster for text, slightly slower for tags
        const delay = isInTag ? 25 : 18;
        
        setTimeout(typeChar, delay);
    }
    
    typeChar();
}

// Smooth scroll to bottom of chat container
function scrollToBottom(smooth = false) {
    const chatContainer = document.getElementById('chatContainer');
    if (chatContainer) {
        // Use instant scroll during typing for better performance
        // Use smooth scroll at the end
        if (smooth) {
            chatContainer.scrollTo({
                top: chatContainer.scrollHeight,
                behavior: 'smooth'
            });
        } else {
            // Instant scroll during typing
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }
}

// Track if first question has been asked
let firstQuestionAsked = false;

// Send button functionality
sendBtn.addEventListener('click', handleSendMessage);

function handleSendMessage() {
    const prompt = promptInput.value.trim();
    if (!prompt) return;
    
    // Remove end message after first question
    if (!firstQuestionAsked) {
        firstQuestionAsked = true;
        const endMessage = document.querySelector('.end-message');
        if (endMessage) {
            endMessage.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
            endMessage.style.opacity = '0';
            endMessage.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                endMessage.remove();
            }, 300);
        }
    }
    
    // Disable input while processing
    promptInput.disabled = true;
    sendBtn.disabled = true;
    
    // Get AI response
    const aiResponse = searchApp(prompt);
    
    // Add message with typing indicator
    const messageGroup = addMessage(prompt, aiResponse, true);
    
    // Clear input
    promptInput.value = '';
    promptInput.style.height = 'auto';
    
    // Type out the response with live typing effect
    setTimeout(() => {
        typeAIResponse(messageGroup, aiResponse);
    }, 300);
}

// Enter key to send (Shift+Enter for new line)
promptInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
});

// Smooth scroll to message on load (if hash present)
window.addEventListener('load', () => {
    if (window.location.hash) {
        const target = document.querySelector(window.location.hash);
        if (target) {
            setTimeout(() => {
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }
});

// Add typing animation effect (optional enhancement)
function addTypingEffect(messageContent) {
    const text = messageContent.textContent;
    messageContent.textContent = '';
    messageContent.classList.add('typing');
    
    let index = 0;
    const typingInterval = setInterval(() => {
        if (index < text.length) {
            messageContent.textContent += text[index];
            index++;
        } else {
            clearInterval(typingInterval);
            messageContent.classList.remove('typing');
        }
    }, 20);
}

// Optional: Add typing effect to AI messages when they become visible
// Uncomment to enable typing animation
/*
const aiMessageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.typed) {
            const aiMessage = entry.target.querySelector('.ai-message .message-content');
            if (aiMessage) {
                entry.target.dataset.typed = 'true';
                addTypingEffect(aiMessage);
            }
        }
    });
}, { threshold: 0.3 });

messageGroups.forEach(group => {
    if (group.querySelector('.ai-message')) {
        aiMessageObserver.observe(group);
    }
});
*/

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        if (document.activeElement !== promptInput) {
            e.preventDefault();
            window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' });
        }
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        if (document.activeElement !== promptInput) {
            e.preventDefault();
            window.scrollBy({ top: -window.innerHeight * 0.8, behavior: 'smooth' });
        }
    }
});

// Highlight current question in view
let currentQuestion = null;
const questionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const questionNum = entry.target.dataset.question;
            if (questionNum) {
                currentQuestion = questionNum;
            }
        }
    });
}, { threshold: 0.5 });

messageGroups.forEach(group => {
    if (group.dataset.question) {
        questionObserver.observe(group);
    }
});

// Clear chat functionality (removes user-asked questions, keeps default ones)
const clearChatBtn = document.getElementById('clearChatBtn');
if (clearChatBtn) {
    clearChatBtn.addEventListener('click', () => {
        const userAddedMessages = document.querySelectorAll('.message-group:not([data-question]):not(.welcome-message):not(.end-message)');
        userAddedMessages.forEach(msg => {
            msg.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
            msg.style.opacity = '0';
            msg.style.transform = 'translateY(-20px)';
            setTimeout(() => msg.remove(), 300);
        });
        
        // Scroll to top
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
    });
}
