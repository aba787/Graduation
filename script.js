
class SmartHealthMonitor {
    constructor() {
        this.currentHeartRate = 75;
        this.currentBloodOxygen = 98;
        this.isMonitoring = true;
        this.alertHistory = [];
        this.emergencyContacts = [
            { name: "د. أحمد محمد", phone: "+966-555-0123", element: "contact1" },
            { name: "أحد أفراد العائلة", phone: "+966-555-0456", element: "contact2" }
        ];

        // Enhanced thresholds with age-based adjustments
        this.thresholds = {
            heartRate: { min: 60, max: 100 },
            bloodOxygen: { min: 95, max: 100 },
            critical: { heartRate: 50, bloodOxygen: 90 },
            emergency: { heartRate: 40, bloodOxygen: 85 }
        };

        // Trend tracking for better prediction
        this.vitalsHistory = [];
        this.maxHistoryLength = 20;
        this.consecutiveAbnormalReadings = 0;
        this.lastNormalTime = Date.now();

        this.init();
    }

    init() {
        this.bindEvents();
        this.startMonitoring();
        this.updateDisplay();
        this.initializeLocalStorage();
        this.showWelcomeMessage();
    }

    initializeLocalStorage() {
        // Load previous alert history if available
        const savedHistory = localStorage.getItem('healthMonitorHistory');
        if (savedHistory) {
            this.alertHistory = JSON.parse(savedHistory).map(alert => ({
                ...alert,
                timestamp: new Date(alert.timestamp)
            }));
            this.updateHistoryDisplay();
        }
    }

    saveToLocalStorage() {
        localStorage.setItem('healthMonitorHistory', JSON.stringify(this.alertHistory));
    }

    showWelcomeMessage() {
        this.updateAlertDisplay("🏥 نظام مراقب الصحة الذكي جاهز للعمل - يتم مراقبة العلامات الحيوية", 'normal');
    }

    bindEvents() {
        // Emergency and reset buttons
        document.getElementById('emergencyBtn').addEventListener('click', () => {
            this.triggerEmergencyAlert("تم تفعيل تنبيه الطوارئ يدوياً - اختبار النظام");
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetSystem();
        });

        // Enhanced simulation buttons
        document.getElementById('simulateNormal').addEventListener('click', () => {
            this.simulateVitals(75, 98, "علامات حيوية طبيعية");
        });

        document.getElementById('simulateLowHR').addEventListener('click', () => {
            this.simulateVitals(45, 98, "معدل قلب منخفض");
        });

        document.getElementById('simulateLowO2').addEventListener('click', () => {
            this.simulateVitals(75, 88, "أكسجين منخفض");
        });

        document.getElementById('simulateCritical').addEventListener('click', () => {
            this.simulateVitals(40, 85, "حالة حرجة");
        });

        // Emergency modal buttons
        document.getElementById('acknowledgeBtn').addEventListener('click', () => {
            this.acknowledgeEmergency();
        });

        document.getElementById('callEmergencyBtn').addEventListener('click', () => {
            this.callEmergencyServices();
        });

        // Close modal when clicking outside
        document.getElementById('emergencyModal').addEventListener('click', (e) => {
            if (e.target.id === 'emergencyModal') {
                this.acknowledgeEmergency();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.acknowledgeEmergency();
            } else if (e.key === 'r' && e.ctrlKey) {
                e.preventDefault();
                this.resetSystem();
            }
        });
    }

    startMonitoring() {
        // Enhanced monitoring with variable intervals
        setInterval(() => {
            if (this.isMonitoring) {
                this.collectBiometricData();
                this.trackVitalsTrends();
                this.analyzeVitals();
                this.updateDisplay();
                this.checkForPatterns();
            }
        }, 1500); // Faster updates for better responsiveness

        // Periodic system health check
        setInterval(() => {
            this.performSystemHealthCheck();
        }, 30000); // Every 30 seconds
    }

    collectBiometricData() {
        // More realistic biometric data simulation
        const hrVariation = this.generateRealisticVariation(this.currentHeartRate, 'heartRate');
        const o2Variation = this.generateRealisticVariation(this.currentBloodOxygen, 'bloodOxygen');

        this.currentHeartRate = Math.max(30, Math.min(150, this.currentHeartRate + hrVariation));
        this.currentBloodOxygen = Math.max(70, Math.min(100, this.currentBloodOxygen + o2Variation));

        // Add to history for trend analysis
        this.vitalsHistory.push({
            timestamp: Date.now(),
            heartRate: this.currentHeartRate,
            bloodOxygen: this.currentBloodOxygen
        });

        // Keep only recent history
        if (this.vitalsHistory.length > this.maxHistoryLength) {
            this.vitalsHistory.shift();
        }
    }

    generateRealisticVariation(currentValue, type) {
        const baseVariation = (Math.random() - 0.5) * 2;
        
        if (type === 'heartRate') {
            // Heart rate can vary more significantly
            const stressVariation = Math.random() > 0.95 ? (Math.random() - 0.5) * 10 : 0;
            return baseVariation + stressVariation;
        } else {
            // Blood oxygen is more stable
            return baseVariation * 0.5;
        }
    }

    trackVitalsTrends() {
        if (this.vitalsHistory.length < 3) return;

        const recent = this.vitalsHistory.slice(-3);
        const hrTrend = this.calculateTrend(recent.map(r => r.heartRate));
        const o2Trend = this.calculateTrend(recent.map(r => r.bloodOxygen));

        // Detect rapid changes that could indicate impending issues
        if (Math.abs(hrTrend) > 5 || Math.abs(o2Trend) > 2) {
            this.triggerTrendAlert(hrTrend, o2Trend);
        }
    }

    calculateTrend(values) {
        if (values.length < 2) return 0;
        return values[values.length - 1] - values[0];
    }

    triggerTrendAlert(hrTrend, o2Trend) {
        const message = `تم اكتشاف تغير سريع في العلامات الحيوية - معدل القلب: ${hrTrend > 0 ? '+' : ''}${hrTrend.toFixed(1)}, الأكسجين: ${o2Trend > 0 ? '+' : ''}${o2Trend.toFixed(1)}`;
        
        if (Math.abs(hrTrend) > 10 || Math.abs(o2Trend) > 3) {
            this.triggerWarningAlert(message);
        }
    }

    analyzeVitals() {
        const hrStatus = this.getVitalStatus(this.currentHeartRate, 'heartRate');
        const o2Status = this.getVitalStatus(this.currentBloodOxygen, 'bloodOxygen');

        // Enhanced critical condition detection
        if (this.currentHeartRate <= this.thresholds.emergency.heartRate || 
            this.currentBloodOxygen <= this.thresholds.emergency.bloodOxygen) {
            this.triggerEmergencyAlert("⚠️ حالة طوارئ حرجة - تحتاج لعناية طبية فورية!");
            this.consecutiveAbnormalReadings++;
        }
        // Check for critical conditions
        else if (this.currentHeartRate <= this.thresholds.critical.heartRate || 
                this.currentBloodOxygen <= this.thresholds.critical.bloodOxygen) {
            this.triggerEmergencyAlert("🚨 علامات حيوية حرجة تم اكتشافها - انتباه فوري مطلوب!");
            this.consecutiveAbnormalReadings++;
        }
        // Check for warning conditions
        else if (hrStatus === 'warning' || o2Status === 'warning') {
            this.triggerWarningAlert(`⚠️ علامات حيوية غير طبيعية - مراقبة دقيقة | القلب: ${Math.round(this.currentHeartRate)} | الأكسجين: ${Math.round(this.currentBloodOxygen)}%`);
            this.consecutiveAbnormalReadings++;
        } else {
            // Normal readings - reset counter
            if (this.consecutiveAbnormalReadings > 0) {
                this.consecutiveAbnormalReadings = 0;
                this.lastNormalTime = Date.now();
                this.updateAlertDisplay("✅ العلامات الحيوية عادت للمعدل الطبيعي", 'normal');
            }
        }
    }

    getVitalStatus(value, type) {
        const threshold = this.thresholds[type];

        if (type === 'heartRate') {
            if (value <= this.thresholds.emergency.heartRate) return 'emergency';
            if (value <= this.thresholds.critical.heartRate) return 'critical';
            if (value < threshold.min || value > threshold.max) return 'warning';
        } else if (type === 'bloodOxygen') {
            if (value <= this.thresholds.emergency.bloodOxygen) return 'emergency';
            if (value <= this.thresholds.critical.bloodOxygen) return 'critical';
            if (value < threshold.min) return 'warning';
        }

        return 'normal';
    }

    updateDisplay() {
        // Update heart rate display with enhanced status
        document.getElementById('heartRate').textContent = Math.round(this.currentHeartRate);
        const hrStatus = this.getVitalStatus(this.currentHeartRate, 'heartRate');
        const hrStatusElement = document.getElementById('hrStatus');
        hrStatusElement.textContent = this.getArabicStatus(hrStatus);
        hrStatusElement.className = `sensor-status ${hrStatus}`;

        // Update blood oxygen display with enhanced status
        document.getElementById('bloodOxygen').textContent = Math.round(this.currentBloodOxygen);
        const o2Status = this.getVitalStatus(this.currentBloodOxygen, 'bloodOxygen');
        const o2StatusElement = document.getElementById('o2Status');
        o2StatusElement.textContent = this.getArabicStatus(o2Status);
        o2StatusElement.className = `sensor-status ${o2Status}`;

        // Update device status
        this.updateDeviceStatus();
    }

    updateDeviceStatus() {
        const statusText = document.getElementById('statusText');
        const statusDot = document.querySelector('.status-dot');

        const timeSinceNormal = Date.now() - this.lastNormalTime;
        
        if (this.consecutiveAbnormalReadings >= 3) {
            statusText.textContent = "تنبيه نشط - مراقبة مكثفة";
            statusDot.style.background = '#FFC107';
        } else if (this.consecutiveAbnormalReadings > 0) {
            statusText.textContent = "مراقبة - قراءات غير طبيعية";
            statusDot.style.background = '#FF9800';
        } else {
            statusText.textContent = "الجهاز متصل - كل شيء طبيعي";
            statusDot.style.background = '#4CAF50';
        }
    }

    getArabicStatus(status) {
        const statusMap = {
            'normal': 'طبيعي',
            'warning': 'تحذير',
            'critical': 'حرج',
            'emergency': 'طوارئ'
        };
        return statusMap[status] || 'طبيعي';
    }

    checkForPatterns() {
        // Pattern detection for fall prediction
        if (this.vitalsHistory.length >= 5) {
            const recent = this.vitalsHistory.slice(-5);
            const avgHR = recent.reduce((sum, r) => sum + r.heartRate, 0) / recent.length;
            const avgO2 = recent.reduce((sum, r) => sum + r.bloodOxygen, 0) / recent.length;

            // Detect sudden drops that could indicate fainting
            if (avgHR < 55 && avgO2 < 92) {
                this.triggerFaintingPrediction();
            }
        }
    }

    triggerFaintingPrediction() {
        const alert = {
            type: 'prediction',
            message: '🔮 توقع محتمل للإغماء - انخفاض في العلامات الحيوية',
            timestamp: new Date(),
            heartRate: this.currentHeartRate,
            bloodOxygen: this.currentBloodOxygen
        };

        this.addToHistory(alert);
        this.updateAlertDisplay(alert.message, 'warning');
        this.playPredictionSound();
    }

    triggerEmergencyAlert(message) {
        const alert = {
            type: 'critical',
            message: message,
            timestamp: new Date(),
            heartRate: this.currentHeartRate,
            bloodOxygen: this.currentBloodOxygen
        };

        this.addToHistory(alert);
        this.showEmergencyModal(message);
        this.notifyEmergencyContacts();
        this.updateAlertDisplay(message, 'critical');
        this.simulateDeviceAlert();
        this.saveToLocalStorage();
    }

    triggerWarningAlert(message) {
        const alert = {
            type: 'warning',
            message: message,
            timestamp: new Date(),
            heartRate: this.currentHeartRate,
            bloodOxygen: this.currentBloodOxygen
        };

        this.addToHistory(alert);
        this.updateAlertDisplay(message, 'warning');
        this.playWarningSound();
        this.saveToLocalStorage();
    }

    showEmergencyModal(message) {
        document.getElementById('emergencyMessage').textContent = message;
        const modal = document.getElementById('emergencyModal');
        modal.style.display = 'block';
        
        // Auto-dismiss after 30 seconds if not acknowledged
        setTimeout(() => {
            if (modal.style.display === 'block') {
                this.acknowledgeEmergency();
            }
        }, 30000);
    }

    acknowledgeEmergency() {
        document.getElementById('emergencyModal').style.display = 'none';
        this.updateAlertDisplay("✅ تم تأكيد استلام التنبيه من المستخدم", 'normal');
    }

    callEmergencyServices() {
        const location = "المنزل"; // Could be enhanced with GPS
        const time = new Date().toLocaleString('ar-SA');
        
        const emergencyInfo = `
🚨 تنبيه طوارئ صحي
👤 المستخدم: مراقب الصحة الذكي
📍 الموقع: ${location}
⏰ الوقت: ${time}
❤️ معدل القلب: ${Math.round(this.currentHeartRate)} ض/د
🫁 أكسجين الدم: ${Math.round(this.currentBloodOxygen)}%
📞 يتم الاتصال بخدمات الطوارئ...
        `;

        alert(emergencyInfo);
        document.getElementById('emergencyModal').style.display = 'none';
        this.updateAlertDisplay("📞 تم الاتصال بخدمات الطوارئ - المساعدة في الطريق", 'normal');
        
        // Log emergency call
        this.addToHistory({
            type: 'emergency_call',
            message: 'تم الاتصال بخدمات الطوارئ',
            timestamp: new Date(),
            heartRate: this.currentHeartRate,
            bloodOxygen: this.currentBloodOxygen
        });
    }

    notifyEmergencyContacts() {
        this.emergencyContacts.forEach((contact, index) => {
            setTimeout(() => {
                const element = document.getElementById(contact.element);
                element.textContent = "تم الإرسال";
                element.className = "contact-status notified";

                const location = "المنزل";
                const smsMessage = `🚨 تنبيه صحي عاجل من ${contact.name.includes('د.') ? 'المريض' : 'القريب'}
📍 الموقع: ${location}
❤️ معدل القلب: ${Math.round(this.currentHeartRate)} ض/د
🫁 أكسجين الدم: ${Math.round(this.currentBloodOxygen)}%
⏰ الوقت: ${new Date().toLocaleTimeString('ar-SA')}
🏥 يرجى التحقق من الحالة فوراً`;

                console.log(`📱 SMS إلى ${contact.name} (${contact.phone}):\n${smsMessage}`);

                // Reset status after 15 seconds
                setTimeout(() => {
                    element.textContent = "جاهز";
                    element.className = "contact-status";
                }, 15000);
            }, index * 1500);
        });
    }

    simulateDeviceAlert() {
        const statusDot = document.querySelector('.status-dot');
        const originalColor = statusDot.style.background;
        
        statusDot.style.background = '#F44336';
        statusDot.style.animation = 'pulse 0.3s infinite';

        // Enhanced vibration pattern
        if ('vibrate' in navigator) {
            navigator.vibrate([300, 100, 300, 100, 300, 200, 500]);
        }

        // Play emergency sound
        this.playEmergencySound();

        console.log("🔊 جهاز التنبيه: السوار يهتز وينبعث منه صوت!");

        setTimeout(() => {
            statusDot.style.background = originalColor || '#4CAF50';
            statusDot.style.animation = 'pulse 2s infinite';
        }, 8000);
    }

    playEmergencySound() {
        // Create audio context for sound generation
        if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            const audioContext = new AudioCtx();
            
            // Generate emergency beep
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    this.generateBeep(audioContext, 800, 200);
                }, i * 300);
            }
        }
    }

    playWarningSound() {
        if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            const audioContext = new AudioCtx();
            this.generateBeep(audioContext, 600, 150);
        }
    }

    playPredictionSound() {
        if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            const audioContext = new AudioCtx();
            this.generateBeep(audioContext, 400, 100);
        }
    }

    generateBeep(audioContext, frequency, duration) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration / 1000);
    }

    updateAlertDisplay(message, type) {
        const alertDisplay = document.getElementById('alertDisplay');
        const time = new Date().toLocaleTimeString('ar-SA');
        alertDisplay.innerHTML = `<p>${message}</p><small>الوقت: ${time}</small>`;
        alertDisplay.className = `alert-display ${type}`;
    }

    addToHistory(alert) {
        this.alertHistory.unshift(alert);
        
        // Keep only last 50 alerts
        if (this.alertHistory.length > 50) {
            this.alertHistory = this.alertHistory.slice(0, 50);
        }
        
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        const historyList = document.getElementById('historyList');

        if (this.alertHistory.length === 0) {
            historyList.innerHTML = '<p class="no-alerts">لا توجد تنبيهات مسجلة</p>';
            return;
        }

        historyList.innerHTML = this.alertHistory.slice(0, 15).map(alert => `
            <div class="history-item ${alert.type}">
                <div class="history-timestamp">${alert.timestamp.toLocaleString('ar-SA')}</div>
                <div class="history-message">${alert.message}</div>
                <div class="history-vitals">القلب: ${Math.round(alert.heartRate)} ض/د | الأكسجين: ${Math.round(alert.bloodOxygen)}%</div>
            </div>
        `).join('');
    }

    simulateVitals(heartRate, bloodOxygen, scenario) {
        this.currentHeartRate = heartRate;
        this.currentBloodOxygen = bloodOxygen;
        this.analyzeVitals();
        this.updateDisplay();
        
        console.log(`🧪 محاكاة السيناريو: ${scenario} - القلب: ${heartRate}, الأكسجين: ${bloodOxygen}%`);
    }

    performSystemHealthCheck() {
        const systemHealth = {
            timestamp: new Date(),
            monitoring: this.isMonitoring,
            historyLength: this.alertHistory.length,
            vitalsHistoryLength: this.vitalsHistory.length,
            consecutiveAbnormal: this.consecutiveAbnormalReadings
        };

        console.log("🔍 فحص صحة النظام:", systemHealth);

        // Auto-maintenance
        if (this.vitalsHistory.length > this.maxHistoryLength * 2) {
            this.vitalsHistory = this.vitalsHistory.slice(-this.maxHistoryLength);
            console.log("🧹 تنظيف ذاكرة البيانات الحيوية");
        }
    }

    resetSystem() {
        this.currentHeartRate = 75;
        this.currentBloodOxygen = 98;
        this.consecutiveAbnormalReadings = 0;
        this.lastNormalTime = Date.now();
        this.vitalsHistory = [];
        
        this.updateDisplay();
        this.updateAlertDisplay("🔄 تم إعادة تعيين النظام - جميع العلامات الحيوية طبيعية", 'normal');

        // Reset emergency contact status
        this.emergencyContacts.forEach(contact => {
            const element = document.getElementById(contact.element);
            element.textContent = "جاهز";
            element.className = "contact-status";
        });

        // Clear any active modal
        document.getElementById('emergencyModal').style.display = 'none';

        console.log("🔄 إعادة تعيين النظام: تمت إعادة معايرة جميع أجهزة الاستشعار");
    }

    // Export data functionality
    exportHealthData() {
        const data = {
            exportTime: new Date(),
            alertHistory: this.alertHistory,
            vitalsHistory: this.vitalsHistory,
            currentVitals: {
                heartRate: this.currentHeartRate,
                bloodOxygen: this.currentBloodOxygen
            }
        };

        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `health_data_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        console.log("📊 تم تصدير بيانات الصحة");
    }
}

// Initialize the Smart Health Monitor when page loads
document.addEventListener('DOMContentLoaded', () => {
    const monitor = new SmartHealthMonitor();

    // Add keyboard shortcut info
    console.log("🏥 نظام مراقب الصحة الذكي مُفعّل");
    console.log("📱 الجهاز المحمول متصل ويراقب...");
    console.log("🔔 نظام التنبيه نشط");
    console.log("📞 جهات اتصال الطوارئ مُكوَّنة");
    console.log("⌨️ اختصارات لوحة المفاتيح:");
    console.log("   - Escape: إغلاق التنبيهات");
    console.log("   - Ctrl+R: إعادة تعيين النظام");

    // Add export functionality to a button (if needed)
    window.healthMonitor = monitor;
});

// Service Worker registration for PWA functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('✅ Service Worker مُسجل'))
            .catch(registrationError => console.log('❌ فشل تسجيل Service Worker'));
    });
}
