class SmartHealthMonitor {
    constructor() {
        this.currentHeartRate = 75;
        this.currentBloodOxygen = 98;
        this.isMonitoring = true;
        this.alertHistory = [];
        this.emergencyContacts = [
            { name: "Dr. Smith", phone: "+1-555-0123", element: "contact1" },
            { name: "Family Member", phone: "+1-555-0456", element: "contact2" }
        ];

        // Thresholds for alert system
        this.thresholds = {
            heartRate: { min: 60, max: 100 },
            bloodOxygen: { min: 95, max: 100 },
            critical: { heartRate: 50, bloodOxygen: 90 }
        };

        this.init();
    }

    init() {
        this.bindEvents();
        this.startMonitoring();
        this.updateDisplay();
    }

    bindEvents() {
        // Emergency and reset buttons
        document.getElementById('emergencyBtn').addEventListener('click', () => {
            this.triggerEmergencyAlert("Manual emergency test activated");
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetSystem();
        });

        // Simulation buttons
        document.getElementById('simulateNormal').addEventListener('click', () => {
            this.simulateVitals(75, 98);
        });

        document.getElementById('simulateLowHR').addEventListener('click', () => {
            this.simulateVitals(45, 98);
        });

        document.getElementById('simulateLowO2').addEventListener('click', () => {
            this.simulateVitals(75, 88);
        });

        document.getElementById('simulateCritical').addEventListener('click', () => {
            this.simulateVitals(40, 85);
        });

        // Emergency modal buttons
        document.getElementById('acknowledgeBtn').addEventListener('click', () => {
            this.acknowledgeEmergency();
        });

        document.getElementById('callEmergencyBtn').addEventListener('click', () => {
            this.callEmergencyServices();
        });
    }

    startMonitoring() {
        // Simulate continuous biometric data collection
        setInterval(() => {
            if (this.isMonitoring) {
                this.collectBiometricData();
                this.analyzeVitals();
                this.updateDisplay();
            }
        }, 2000); // Update every 2 seconds
    }

    collectBiometricData() {
        // Simulate natural variations in vitals
        const hrVariation = (Math.random() - 0.5) * 4;
        const o2Variation = (Math.random() - 0.5) * 2;

        this.currentHeartRate = Math.max(30, Math.min(120, this.currentHeartRate + hrVariation));
        this.currentBloodOxygen = Math.max(80, Math.min(100, this.currentBloodOxygen + o2Variation));
    }

    analyzeVitals() {
        const hrStatus = this.getVitalStatus(this.currentHeartRate, 'heartRate');
        const o2Status = this.getVitalStatus(this.currentBloodOxygen, 'bloodOxygen');

        // Check for critical conditions
        if (this.currentHeartRate <= this.thresholds.critical.heartRate || 
            this.currentBloodOxygen <= this.thresholds.critical.bloodOxygen) {
            this.triggerEmergencyAlert("Critical vital signs detected - immediate attention required!");
        }
        // Check for warning conditions
        else if (hrStatus === 'warning' || o2Status === 'warning') {
            this.triggerWarningAlert("Abnormal vital signs detected - monitoring closely");
        }
    }

    getVitalStatus(value, type) {
        const threshold = this.thresholds[type];

        if (type === 'heartRate') {
            if (value <= this.thresholds.critical.heartRate || value < threshold.min || value > threshold.max) {
                return value <= this.thresholds.critical.heartRate ? 'critical' : 'warning';
            }
        } else if (type === 'bloodOxygen') {
            if (value <= this.thresholds.critical.bloodOxygen || value < threshold.min) {
                return value <= this.thresholds.critical.bloodOxygen ? 'critical' : 'warning';
            }
        }

        return 'normal';
    }

    updateDisplay() {
        // Update heart rate display
        document.getElementById('heartRate').textContent = Math.round(this.currentHeartRate);
        const hrStatus = this.getVitalStatus(this.currentHeartRate, 'heartRate');
        const hrStatusElement = document.getElementById('hrStatus');
        hrStatusElement.textContent = hrStatus.charAt(0).toUpperCase() + hrStatus.slice(1);
        hrStatusElement.className = `sensor-status ${hrStatus}`;

        // Update blood oxygen display
        document.getElementById('bloodOxygen').textContent = Math.round(this.currentBloodOxygen);
        const o2Status = this.getVitalStatus(this.currentBloodOxygen, 'bloodOxygen');
        const o2StatusElement = document.getElementById('o2Status');
        o2StatusElement.textContent = o2Status.charAt(0).toUpperCase() + o2Status.slice(1);
        o2StatusElement.className = `sensor-status ${o2Status}`;
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

        // Trigger device vibration/sound simulation
        this.simulateDeviceAlert();
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
    }

    showEmergencyModal(message) {
        document.getElementById('emergencyMessage').textContent = message;
        document.getElementById('emergencyModal').style.display = 'block';
    }

    acknowledgeEmergency() {
        document.getElementById('emergencyModal').style.display = 'none';
        this.updateAlertDisplay("Emergency acknowledged by user", 'normal');
    }

    callEmergencyServices() {
        alert("🚨 Emergency services would be contacted automatically!\n📞 Calling 911...\n📍 GPS location transmitted\n🏥 Medical history shared");
        document.getElementById('emergencyModal').style.display = 'none';
        this.updateAlertDisplay("Emergency services contacted", 'normal');
    }

    notifyEmergencyContacts() {
        this.emergencyContacts.forEach((contact, index) => {
            setTimeout(() => {
                const element = document.getElementById(contact.element);
                element.textContent = "SMS Sent";
                element.className = "contact-status notified";

                // Simulate SMS notification
                console.log(`🚨 تم إرسال تنبيه SMS إلى ${contact.name} (${contact.phone}): "تنبيه صحي: تم اكتشاف علامات حيوية غير طبيعية لأحد أفراد عائلتك. معدل القلب: ${Math.round(this.currentHeartRate)} ض/د، أكسجين الدم: ${Math.round(this.currentBloodOxygen)}%. الموقع: المنزل. الوقت: ${new Date().toLocaleTimeString()}"`);

                // Reset status after 10 seconds
                setTimeout(() => {
                    element.textContent = "جاهز";
                    element.className = "contact-status";
                }, 10000);
            }, index * 1000);
        });
    }

    simulateDeviceAlert() {
        // Simulate bracelet vibration and sound
        const statusDot = document.querySelector('.status-dot');
        statusDot.style.background = '#F44336';
        statusDot.style.animation = 'pulse 0.5s infinite';

        // Play notification sound (simulation)
        if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200, 100, 200]);
        }

        console.log("🔊 Device Alert: Bracelet vibrating and beeping!");

        setTimeout(() => {
            statusDot.style.background = '#4CAF50';
            statusDot.style.animation = 'pulse 2s infinite';
        }, 5000);
    }

    updateAlertDisplay(message, type) {
        const alertDisplay = document.getElementById('alertDisplay');
        alertDisplay.innerHTML = `<p>${message}</p><small>Time: ${new Date().toLocaleTimeString()}</small>`;
        alertDisplay.className = `alert-display ${type}`;
    }

    addToHistory(alert) {
        this.alertHistory.unshift(alert);
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        const historyList = document.getElementById('historyList');

        if (this.alertHistory.length === 0) {
            historyList.innerHTML = '<p class="no-alerts">No alerts recorded</p>';
            return;
        }

        historyList.innerHTML = this.alertHistory.slice(0, 10).map(alert => `
            <div class="history-item ${alert.type}">
                <div class="history-timestamp">${alert.timestamp.toLocaleString()}</div>
                <div class="history-message">${alert.message}</div>
                <div class="history-vitals">HR: ${Math.round(alert.heartRate)} BPM | SpO2: ${Math.round(alert.bloodOxygen)}%</div>
            </div>
        `).join('');
    }

    simulateVitals(heartRate, bloodOxygen) {
        this.currentHeartRate = heartRate;
        this.currentBloodOxygen = bloodOxygen;
        this.analyzeVitals();
        this.updateDisplay();
    }

    resetSystem() {
        this.currentHeartRate = 75;
        this.currentBloodOxygen = 98;
        this.updateDisplay();
        this.updateAlertDisplay("System reset - All vitals normal", 'normal');

        // Reset emergency contact status
        this.emergencyContacts.forEach(contact => {
            const element = document.getElementById(contact.element);
            element.textContent = "جاهز";
            element.className = "contact-status";
        });

        console.log("🔄 System Reset: All sensors recalibrated");
    }
}

// Initialize the Smart Health Monitor when page loads
document.addEventListener('DOMContentLoaded', () => {
    const monitor = new SmartHealthMonitor();

    console.log("🏥 Smart Health Monitor System Initialized");
    console.log("📱 Wearable device connected and monitoring...");
    console.log("🔔 Alert system active");
    console.log("📞 Emergency contacts configured");
});

// Service Worker registration for PWA functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(registrationError => console.log('SW registration failed'));
    });
}