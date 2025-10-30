// ============================================
// GLOBAL VARIABLES
// ============================================

let notificationDropdownOpen = false;

// ============================================
// NOTIFICATION FUNCTIONS
// ============================================

// Toggle notification dropdown
document.addEventListener('DOMContentLoaded', function() {
    const notificationBell = document.getElementById('notificationBell');
    const notificationDropdown = document.getElementById('notificationDropdown');
    const closeNotifications = document.getElementById('closeNotifications');
    
    if (notificationBell) {
        notificationBell.addEventListener('click', function() {
            notificationDropdownOpen = !notificationDropdownOpen;
            
            if (notificationDropdownOpen) {
                notificationDropdown.style.display = 'block';
                loadNotifications();
            } else {
                notificationDropdown.style.display = 'none';
            }
        });
    }
    
    if (closeNotifications) {
        closeNotifications.addEventListener('click', function() {
            notificationDropdown.style.display = 'none';
            notificationDropdownOpen = false;
        });
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        if (notificationDropdownOpen && 
            !notificationDropdown.contains(event.target) && 
            !notificationBell.contains(event.target)) {
            notificationDropdown.style.display = 'none';
            notificationDropdownOpen = false;
        }
    });
    
    // Load notifications on page load
    updateNotificationBadge();
});

// Load notifications from server
function loadNotifications() {
    fetch('/notifications')
        .then(response => response.json())
        .then(data => {
            const notificationList = document.getElementById('notificationList');
            
            if (data.notifications.length === 0) {
                notificationList.innerHTML = '<p class="no-notifications">No new notifications</p>';
                return;
            }
            
            let html = '';
            data.notifications.forEach(notification => {
                const unreadClass = notification.is_read ? '' : 'unread';
                const time = new Date(notification.created_at).toLocaleString();
                
                html += `
                    <div class="notification-item ${unreadClass}" onclick="markAsRead(${notification.id})">
                        <p><strong>${notification.message}</strong></p>
                        <small>${time}</small>
                    </div>
                `;
            });
            
            notificationList.innerHTML = html;
        })
        .catch(error => {
            console.error('Error loading notifications:', error);
        });
}

// Mark notification as read
function markAsRead(notificationId) {
    fetch(`/notifications/${notificationId}/read`, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadNotifications();
            updateNotificationBadge();
        }
    })
    .catch(error => {
        console.error('Error marking notification as read:', error);
    });
}

// Update notification badge count
function updateNotificationBadge() {
    fetch('/notifications')
        .then(response => response.json())
        .then(data => {
            const unreadCount = data.notifications.filter(n => !n.is_read).length;
            const badge = document.getElementById('notificationCount');
            
            if (unreadCount > 0) {
                badge.textContent = unreadCount;
                badge.style.display = 'block';
            } else {
                badge.style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Error updating notification badge:', error);
        });
}

// Show popup notification
function showNotificationPopup(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'flash-message flash-info';
    notification.innerHTML = `
        <span>${message}</span>
        <button class="flash-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to flash container or create one
    let flashContainer = document.querySelector('.flash-container');
    if (!flashContainer) {
        flashContainer = document.createElement('div');
        flashContainer.className = 'flash-container';
        document.body.appendChild(flashContainer);
    }
    
    flashContainer.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
    
    // Play notification sound (optional)
    playNotificationSound();
}

// Play notification sound
function playNotificationSound() {
    // Create a simple beep sound using Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
        console.log('Could not play notification sound:', error);
    }
}

// ============================================
// AUTO-HIDE FLASH MESSAGES
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const flashMessages = document.querySelectorAll('.flash-message');
    
    flashMessages.forEach(message => {
        setTimeout(() => {
            message.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                message.remove();
            }, 300);
        }, 5000);
    });
});

// Add slideOut animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Show loading spinner (if needed)
function showLoading() {
    // Implement loading spinner if needed
}

function hideLoading() {
    // Hide loading spinner if needed
}

console.log('QA Platform JavaScript loaded successfully!');
