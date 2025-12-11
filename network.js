// Helper: random weight 0.0 - 3.0 with one decimal place
function randomWeightValue() {
    const val = Math.round(Math.random() * 30) / 10; // 0.0 - 3.0 step 0.1
    return val.toFixed(1);
}

function getInputValues() {
    const i1 = parseFloat(document.getElementById('inputVal1')?.value) || 0;
    const i2 = parseFloat(document.getElementById('inputVal2')?.value) || 0;
    return { i1, i2 };
}

class Layer1Visualization {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Network configuration
        this.input1 = null;
        this.input2 = null;
        this.bias = null;
        this.output = null;
        this.signals = [];
        
        this.isAnimating = false;
        this.animationFrameId = null;
        this.firstSpawn = true;
        
        this.setupNetwork();
        this.draw();
    }
    
    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }
    
    setupNetwork() {
        const padding = 100;
        const centerY = this.canvas.height / 2;
        
        // Create two input neurons on the left
        this.input1 = {
            x: padding,
            y: centerY - 60,
            radius: 15,
            label: 'Input 1'
        };
        
        this.input2 = {
            x: padding,
            y: centerY + 60,
            radius: 15,
            label: 'Input 2'
        };
        
        // Create bias circle at the top (smaller)
        this.bias = {
            x: padding,
            y: centerY - 120,
            radius: 10,
            label: 'Bias'
        };
        
        // Create output neuron on the right
        this.output = {
            x: this.canvas.width - padding,
            y: centerY,
            radius: 15,
            label: 'Output'
        };

        // Weights: inputs -> output
        this.w_input1_output = randomWeightValue();
        this.w_input2_output = randomWeightValue();
        this.w_bias_output = '1.0'; // bias fixed at 1
    }
    
    start() {
        if (!this.isAnimating) {
            this.isAnimating = true;
            this.firstSpawn = true;
            this.updateCalculationDisplay();
            this.animate();
        }
    }
    
    stop() {
        this.isAnimating = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }
    
    reset() {
        this.stop();
        this.signals = [];
        this.setupNetwork();
        this.draw();
        this.updateCalculationDisplay();
        this.firstSpawn = true;
    }
    
    animate() {
        if (!this.isAnimating) return;
        
        // Spawn signals only on first frame
        if (this.firstSpawn && this.signals.length === 0) {
            this.firstSpawn = false;
            this.signals.push({
                startX: this.input1.x,
                startY: this.input1.y,
                endX: this.output.x,
                endY: this.output.y,
                progress: 0,
                speed: 0.005,
                color: '#ff3333',
                radius: 6
            });
            
            this.signals.push({
                startX: this.input2.x,
                startY: this.input2.y,
                endX: this.output.x,
                endY: this.output.y,
                progress: 0,
                speed: 0.005,
                color: '#ff3333',
                radius: 6
            });
            
            this.signals.push({
                startX: this.bias.x,
                startY: this.bias.y,
                endX: this.output.x,
                endY: this.output.y,
                progress: 0,
                speed: 0.005,
                color: '#ff3333',
                radius: 6
            });
        }
        
        // Update and remove finished signals
        this.signals = this.signals.filter(signal => {
            signal.progress += signal.speed;
            return signal.progress < 1;
        });
        
        // If all signals are done, stop the animation
        if (this.signals.length === 0 && !this.firstSpawn) {
            this.isAnimating = false;
            this.draw();
            return;
        }
        
        // Continue animation
        this.draw();
        this.animationFrameId = requestAnimationFrame(() => this.animate());
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#f9f9f9';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw connection lines
        this.ctx.strokeStyle = '#ccc';
        this.ctx.lineWidth = 2;
        
        // Line from input1 to output
        this.ctx.beginPath();
        this.ctx.moveTo(this.input1.x, this.input1.y);
        this.ctx.lineTo(this.output.x, this.output.y);
        this.ctx.stroke();
        // Draw weight near midpoint
        this.ctx.fillStyle = '#333';
        this.ctx.font = '12px sans-serif';
        let mx = (this.input1.x + this.output.x) / 2;
        let my = (this.input1.y + this.output.y) / 2 - 8;
        this.ctx.fillText(this.w_input1_output, mx, my);
        
        // Line from input2 to output
        this.ctx.beginPath();
        this.ctx.moveTo(this.input2.x, this.input2.y);
        this.ctx.lineTo(this.output.x, this.output.y);
        this.ctx.stroke();
        mx = (this.input2.x + this.output.x) / 2;
        my = (this.input2.y + this.output.y) / 2 + 8;
        this.ctx.fillText(this.w_input2_output, mx, my);
        
        // Line from bias to output
        this.ctx.beginPath();
        this.ctx.moveTo(this.bias.x, this.bias.y);
        this.ctx.lineTo(this.output.x, this.output.y);
        this.ctx.stroke();
        mx = (this.bias.x + this.output.x) / 2 - 6;
        my = (this.bias.y + this.output.y) / 2 - 6;
        this.ctx.fillText(this.w_bias_output, mx, my);
        
        // Draw input neurons
        this.ctx.fillStyle = '#e8e8e8';
        this.ctx.strokeStyle = '#667eea';
        this.ctx.lineWidth = 2;
        
        this.ctx.beginPath();
        this.ctx.arc(this.input1.x, this.input1.y, this.input1.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.arc(this.input2.x, this.input2.y, this.input2.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Draw bias circle (smaller)
        this.ctx.fillStyle = '#fff3e0';
        this.ctx.strokeStyle = '#ff9800';
        this.ctx.lineWidth = 2;
        
        this.ctx.beginPath();
        this.ctx.arc(this.bias.x, this.bias.y, this.bias.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Draw output neuron
        this.ctx.fillStyle = '#e8e8e8';
        this.ctx.strokeStyle = '#667eea';
        this.ctx.lineWidth = 2;
        
        this.ctx.beginPath();
        this.ctx.arc(this.output.x, this.output.y, this.output.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Draw signals (red dots, no glow)
        this.ctx.fillStyle = '#ff3333';
        this.signals.forEach(signal => {
            const x = signal.startX + (signal.endX - signal.startX) * signal.progress;
            const y = signal.startY + (signal.endY - signal.startY) * signal.progress;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, signal.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Draw labels
        this.ctx.fillStyle = '#333';
        this.ctx.font = 'bold 14px sans-serif';
        this.ctx.textAlign = 'center';
        
        this.ctx.fillText('Input 1', this.input1.x, this.input1.y + 40);
        this.ctx.fillText('Input 2', this.input2.x, this.input2.y + 40);
        this.ctx.fillText('Bias', this.bias.x, this.bias.y + 30);
        this.ctx.fillText('Output', this.output.x, this.output.y + 40);
    }

    updateCalculationDisplay() {
        const el = document.getElementById('calc1');
        if (!el) return;
        const { i1, i2 } = getInputValues();
        const w1 = parseFloat(this.w_input1_output);
        const w2 = parseFloat(this.w_input2_output);
        const wb = parseFloat(this.w_bias_output);
        const result = i1 * w1 + i2 * w2 + 1 * wb;
        const lines = [];
        lines.push(`Formula: Output = (Input1 × ${w1}) + (Input2 × ${w2}) + (Bias × ${wb})`);
        lines.push(`Calculation: (${i1} × ${w1}) + (${i2} × ${w2}) + (1 × ${wb}) = ${result.toFixed(3)}`);
        el.textContent = lines.join('\n');
    }
}
class Layer3Visualization {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        this.isAnimating = false;
        this.animationFrameId = null;
        this.signals = [];
        this.stage = 1;
        this.firstSpawn = true;
        this.shouldSpawnStage2 = false;
        this.stageFrameCount = 0;
        
        this.setupNetwork();
        this.draw();
    }
    
    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        if (this.isAnimating) this.draw();
    }
    
    setupNetwork() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        // Layer 1: Inputs and Bias
        this.input1 = { x: w * 0.15, y: h * 0.35, label: 'Input 1' };
        this.input2 = { x: w * 0.15, y: h * 0.65, label: 'Input 2' };
        this.bias1 = { x: w * 0.15, y: h * 0.5, label: 'Bias' };
        
        // Layer 2: Hidden neurons
        this.hidden1 = { x: w * 0.5, y: h * 0.35, label: 'Hidden 1' };
        this.hidden2 = { x: w * 0.5, y: h * 0.65, label: 'Hidden 2' };
        // Place bias above the hidden neurons
        this.bias2 = { x: w * 0.5, y: h * 0.18, label: 'Bias' };
        
        // Layer 3: Output
        this.output = { x: w * 0.85, y: h * 0.5, label: 'Output' };

        // Stage 1 weights (inputs/bias -> each hidden)
        this.w_i1_h1 = randomWeightValue();
        this.w_i1_h2 = randomWeightValue();
        this.w_i2_h1 = randomWeightValue();
        this.w_i2_h2 = randomWeightValue();
        this.w_b1_h1 = '1.0';
        this.w_b1_h2 = '1.0';

        // Stage 2 weights (hidden/bias2 -> output)
        this.w_h1_out = randomWeightValue();
        this.w_h2_out = randomWeightValue();
        this.w_b2_out = '1.0';
    }
    
    start() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        this.firstSpawn = true;
        this.shouldSpawnStage2 = false;
        this.stageFrameCount = 0;
        this.stage = 1;
        this.signals = [];
        this.updateCalculationDisplay();
        this.animate();
    }
    
    stop() {
        this.isAnimating = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
    
    reset() {
        this.stop();
        this.signals = [];
        this.stage = 1;
        this.firstSpawn = true;
        this.shouldSpawnStage2 = false;
        this.stageFrameCount = 0;
        this.setupNetwork();
        this.draw();
        this.updateCalculationDisplay();
    }
    
    animate() {
        if (!this.isAnimating) return;
        
        // Stage 1: Spawn signals from inputs to hidden layer
        if (this.stage === 1 && this.firstSpawn) {
            this.firstSpawn = false;
            // Dot from input1 to both hidden neurons
            this.signals.push({
                startX: this.input1.x, startY: this.input1.y,
                endX: this.hidden1.x, endY: this.hidden1.y,
                progress: 0, speed: 0.003, color: '#ef4444', radius: 8, stage: 1
            });
            this.signals.push({
                startX: this.input1.x, startY: this.input1.y,
                endX: this.hidden2.x, endY: this.hidden2.y,
                progress: 0, speed: 0.003, color: '#ef4444', radius: 8, stage: 1
            });
            // Dot from input2 to both hidden neurons
            this.signals.push({
                startX: this.input2.x, startY: this.input2.y,
                endX: this.hidden1.x, endY: this.hidden1.y,
                progress: 0, speed: 0.003, color: '#ef4444', radius: 8, stage: 1
            });
            this.signals.push({
                startX: this.input2.x, startY: this.input2.y,
                endX: this.hidden2.x, endY: this.hidden2.y,
                progress: 0, speed: 0.003, color: '#ef4444', radius: 8, stage: 1
            });
            // Dot from bias to both hidden neurons
            this.signals.push({
                startX: this.bias1.x, startY: this.bias1.y,
                endX: this.hidden1.x, endY: this.hidden1.y,
                progress: 0, speed: 0.003, color: '#ef4444', radius: 8, stage: 1
            });
            this.signals.push({
                startX: this.bias1.x, startY: this.bias1.y,
                endX: this.hidden2.x, endY: this.hidden2.y,
                progress: 0, speed: 0.003, color: '#ef4444', radius: 8, stage: 1
            });
        }
        
        this.stageFrameCount++;

        // Stage 2: Spawn signals from hidden neurons to output (spawn will be triggered
        // after stage 1 signals have finished; see check after signals update)
        if (this.stage === 2 && this.shouldSpawnStage2) {
            this.shouldSpawnStage2 = false;
            this.signals = [];
            // Clear stage 1 signals
            
            // Dot from hidden1 to output
            this.signals.push({
                startX: this.hidden1.x, startY: this.hidden1.y,
                endX: this.output.x, endY: this.output.y,
                progress: 0, speed: 0.003, color: '#ef4444', radius: 8, stage: 2
            });
            // Dot from hidden2 to output
            this.signals.push({
                startX: this.hidden2.x, startY: this.hidden2.y,
                endX: this.output.x, endY: this.output.y,
                progress: 0, speed: 0.003, color: '#ef4444', radius: 8, stage: 2
            });
            // Dot from bias2 to output
            this.signals.push({
                startX: this.bias2.x, startY: this.bias2.y,
                endX: this.output.x, endY: this.output.y,
                progress: 0, speed: 0.003, color: '#ef4444', radius: 8, stage: 2
            });
        }
        
        // Update signals
        this.signals = this.signals.filter(signal => {
            signal.progress += signal.speed;
            return signal.progress < 1;
        });

        // If stage 1 has finished (no more signals), move to stage 2
        if (this.stage === 1 && this.signals.length === 0) {
            this.stage = 2;
            this.shouldSpawnStage2 = true;
            this.stageFrameCount = 0;
        }

        // Check if animation is complete (don't stop while a stage-2 spawn is pending)
        if (this.stage === 2 && this.signals.length === 0 && !this.shouldSpawnStage2) {
            this.isAnimating = false;
        }
        
        this.draw();
        
        if (this.isAnimating) {
            this.animationFrameId = requestAnimationFrame(() => this.animate());
        }
    }
    
    draw() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        // Clear canvas
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(0, 0, w, h);
        
        // Draw connections
        this.ctx.strokeStyle = '#ddd';
        this.ctx.lineWidth = 2;
        
        // Stage 1 connections (inputs/bias to hidden)
        [this.input1, this.input2, this.bias1].forEach(input => {
            [this.hidden1, this.hidden2].forEach(hidden => {
                this.ctx.beginPath();
                this.ctx.moveTo(input.x, input.y);
                this.ctx.lineTo(hidden.x, hidden.y);
                this.ctx.stroke();
            });
        });
        // Draw weights for stage 1 connections
        this.ctx.fillStyle = '#333';
        this.ctx.font = '12px sans-serif';
        // input1 -> hidden1
        let mx = (this.input1.x + this.hidden1.x) / 2;
        let my = (this.input1.y + this.hidden1.y) / 2 - 8;
        this.ctx.fillText(this.w_i1_h1, mx, my);
        // input1 -> hidden2
        mx = (this.input1.x + this.hidden2.x) / 2;
        my = (this.input1.y + this.hidden2.y) / 2 + 8;
        this.ctx.fillText(this.w_i1_h2, mx, my);
        // input2 -> hidden1
        mx = (this.input2.x + this.hidden1.x) / 2;
        my = (this.input2.y + this.hidden1.y) / 2 - 8;
        this.ctx.fillText(this.w_i2_h1, mx, my);
        // input2 -> hidden2
        mx = (this.input2.x + this.hidden2.x) / 2;
        my = (this.input2.y + this.hidden2.y) / 2 + 8;
        this.ctx.fillText(this.w_i2_h2, mx, my);
        // bias1 -> hidden1
        mx = (this.bias1.x + this.hidden1.x) / 2 - 6;
        my = (this.bias1.y + this.hidden1.y) / 2 - 6;
        this.ctx.fillText(this.w_b1_h1, mx, my);
        // bias1 -> hidden2
        mx = (this.bias1.x + this.hidden2.x) / 2 - 6;
        my = (this.bias1.y + this.hidden2.y) / 2 + 6;
        this.ctx.fillText(this.w_b1_h2, mx, my);
        
        // Stage 2 connections (hidden/bias2 to output)
        [this.hidden1, this.hidden2, this.bias2].forEach(hidden => {
            this.ctx.beginPath();
            this.ctx.moveTo(hidden.x, hidden.y);
            this.ctx.lineTo(this.output.x, this.output.y);
            this.ctx.stroke();
        });
        // Draw stage 2 weights
        mx = (this.hidden1.x + this.output.x) / 2;
        my = (this.hidden1.y + this.output.y) / 2 - 8;
        this.ctx.fillText(this.w_h1_out, mx, my);
        mx = (this.hidden2.x + this.output.x) / 2;
        my = (this.hidden2.y + this.output.y) / 2 + 8;
        this.ctx.fillText(this.w_h2_out, mx, my);
        mx = (this.bias2.x + this.output.x) / 2 - 6;
        my = (this.bias2.y + this.output.y) / 2 - 6;
        this.ctx.fillText(this.w_b2_out, mx, my);
        
        // Draw neurons
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        
        [this.input1, this.input2, this.bias1, this.hidden1, this.hidden2, this.bias2, this.output].forEach(neuron => {
            this.ctx.beginPath();
            this.ctx.arc(neuron.x, neuron.y, 12, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
        });
        
        // Draw signals
        this.signals.forEach(signal => {
            const x = signal.startX + (signal.endX - signal.startX) * signal.progress;
            const y = signal.startY + (signal.endY - signal.startY) * signal.progress;
            
            this.ctx.fillStyle = signal.color;
            this.ctx.beginPath();
            this.ctx.arc(x, y, signal.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Draw labels
        this.ctx.fillStyle = '#333';
        this.ctx.font = 'bold 14px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        this.ctx.fillText('Input 1', this.input1.x, this.input1.y - 30);
        this.ctx.fillText('Input 2', this.input2.x, this.input2.y + 30);
        this.ctx.fillText('Bias', this.bias1.x, this.bias1.y + 30);
        this.ctx.fillText('Hidden 1', this.hidden1.x, this.hidden1.y - 30);
        this.ctx.fillText('Hidden 2', this.hidden2.x, this.hidden2.y + 30);
        this.ctx.fillText('Bias', this.bias2.x, this.bias2.y + 30);
        this.ctx.fillText('Output', this.output.x, this.output.y - 30);
    }

    updateCalculationDisplay() {
        const el = document.getElementById('calc3');
        if (!el) return;
        const { i1, i2 } = getInputValues();
        const w_i1_h1 = parseFloat(this.w_i1_h1);
        const w_i1_h2 = parseFloat(this.w_i1_h2);
        const w_i2_h1 = parseFloat(this.w_i2_h1);
        const w_i2_h2 = parseFloat(this.w_i2_h2);
        const wb1_h1 = parseFloat(this.w_b1_h1);
        const wb1_h2 = parseFloat(this.w_b1_h2);
        const h1 = i1 * w_i1_h1 + i2 * w_i2_h1 + 1 * wb1_h1;
        const h2 = i1 * w_i1_h2 + i2 * w_i2_h2 + 1 * wb1_h2;
        const wh1 = parseFloat(this.w_h1_out);
        const wh2 = parseFloat(this.w_h2_out);
        const wb2 = parseFloat(this.w_b2_out);
        const out = h1 * wh1 + h2 * wh2 + 1 * wb2;
        const lines = [];
        lines.push('Hidden 1 = (Input1 × ' + w_i1_h1 + ') + (Input2 × ' + w_i2_h1 + ') + (Bias × ' + wb1_h1 + ')');
        lines.push('Calculation: (' + i1 + '×' + w_i1_h1 + ') + (' + i2 + '×' + w_i2_h1 + ') + (1×' + wb1_h1 + ') = ' + h1.toFixed(3));
        lines.push('');
        lines.push('Hidden 2 = (Input1 × ' + w_i1_h2 + ') + (Input2 × ' + w_i2_h2 + ') + (Bias × ' + wb1_h2 + ')');
        lines.push('Calculation: (' + i1 + '×' + w_i1_h2 + ') + (' + i2 + '×' + w_i2_h2 + ') + (1×' + wb1_h2 + ') = ' + h2.toFixed(3));
        lines.push('');
        lines.push('Output = (Hidden1 × ' + wh1 + ') + (Hidden2 × ' + wh2 + ') + (Bias × ' + wb2 + ')');
        lines.push('Calculation: (' + h1.toFixed(3) + '×' + wh1 + ') + (' + h2.toFixed(3) + '×' + wh2 + ') + (1×' + wb2 + ') = ' + out.toFixed(3));
        el.textContent = lines.join('\n');
    }
}


class Layer2Visualization {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Network configuration - Stage 1 (same as Layer 1)
        this.input1 = null;
        this.input2 = null;
        this.bias = null;
        this.output = null;
        
        // Stage 2 (after sigmoid)
        this.bias2 = null;
        this.finalOutput = null;
        
        this.signals = [];
        this.sigmoidFlash = null;
        this.stage = 1; // Track which stage we're in
        
        this.isAnimating = false;
        this.animationFrameId = null;
        this.firstSpawn = true;
        
        this.setupNetwork();
        this.draw();
    }
    
    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }
    
    setupNetwork() {
        const padding = 100;
        const centerY = this.canvas.height / 2;
        
        // Stage 1: Create two input neurons on the left (same as Layer 1)
        this.input1 = {
            x: padding,
            y: centerY - 60,
            radius: 15,
            label: 'Input 1'
        };
        
        this.input2 = {
            x: padding,
            y: centerY + 60,
            radius: 15,
            label: 'Input 2'
        };
        
        // Create bias circle at the top (smaller)
        this.bias = {
            x: padding,
            y: centerY - 120,
            radius: 10,
            label: 'Bias'
        };
        
        // Create output neuron on the right
        this.output = {
            x: this.canvas.width * 0.5,
            y: centerY,
            radius: 15,
            label: 'Hidden Output'
        };
        
        // Stage 2: Bias 2 for the second layer
        this.bias2 = {
            x: this.canvas.width * 0.5,
            y: centerY - 120,
            radius: 10,
            label: 'Bias 2'
        };
        
        // Final output after sigmoid
        this.finalOutput = {
            x: this.canvas.width - padding,
            y: centerY,
            radius: 15,
            label: 'Final Output'
        };

        // Stage 1 weights (inputs -> hidden output)
        this.w_input1_hidden = randomWeightValue();
        this.w_input2_hidden = randomWeightValue();
        this.w_bias_hidden = '1.0';

        // Stage 2 weights (hidden/output -> final)
        this.w_output_final = randomWeightValue();
        this.w_bias2_final = '1.0';
    }
    
    start() {
        if (!this.isAnimating) {
            this.isAnimating = true;
            this.firstSpawn = true;
            this.updateCalculationDisplay();
            this.animate();
        }
    }
    
    stop() {
        this.isAnimating = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }
    
    reset() {
        this.stop();
        this.signals = [];
        this.sigmoidFlash = null;
        this.firstSpawn = true;
        this.stage = 1;
        this.setupNetwork();
        this.draw();
        this.updateCalculationDisplay();
    }
    
    animate() {
        if (!this.isAnimating) return;
        
        // Stage 1: Spawn signals from inputs to first output
        if (this.stage === 1 && this.firstSpawn && this.signals.length === 0) {
            this.firstSpawn = false;
            this.signals.push({
                startX: this.input1.x,
                startY: this.input1.y,
                endX: this.output.x,
                endY: this.output.y,
                progress: 0,
                speed: 0.005,
                color: '#ff3333',
                radius: 6,
                stage: 1
            });
            
            this.signals.push({
                startX: this.input2.x,
                startY: this.input2.y,
                endX: this.output.x,
                endY: this.output.y,
                progress: 0,
                speed: 0.005,
                color: '#ff3333',
                radius: 6,
                stage: 1
            });
            
            this.signals.push({
                startX: this.bias.x,
                startY: this.bias.y,
                endX: this.output.x,
                endY: this.output.y,
                progress: 0,
                speed: 0.005,
                color: '#ff3333',
                radius: 6,
                stage: 1
            });
        }
        
        // Update and remove finished signals
        let shouldSpawnStage2 = false;
        this.signals = this.signals.filter(signal => {
            signal.progress += signal.speed;
            
            // When stage 1 signals reach output, trigger sigmoid and move to stage 2
            if (signal.progress >= 1 && signal.stage === 1) {
                if (this.stage === 1) {
                    this.sigmoidFlash = { intensity: 1, duration: 80 };
                    this.stage = 2;
                }
                return false;
            }
            
            return signal.progress < 1;
        });
        
        // Spawn stage 2 signals after filter completes
        if (shouldSpawnStage2) {
            this.signals.push({
                startX: this.output.x,
                startY: this.output.y,
                endX: this.finalOutput.x,
                endY: this.finalOutput.y,
                progress: 0,
                speed: 0.005,
                color: '#ff3333',
                radius: 6,
                stage: 2
            });
            
            this.signals.push({
                startX: this.bias2.x,
                startY: this.bias2.y,
                endX: this.finalOutput.x,
                endY: this.finalOutput.y,
                progress: 0,
                speed: 0.005,
                color: '#ff3333',
                radius: 6,
                stage: 2
            });
        }
        
        // Update sigmoid flash
        if (this.sigmoidFlash) {
            this.sigmoidFlash.duration--;
            if (this.sigmoidFlash.duration <= 0) {
                this.sigmoidFlash = null;
                // Spawn stage 2 signals after flash completes
                if (this.stage === 2 && this.signals.length === 0) {
                    this.signals.push({
                        startX: this.output.x,
                        startY: this.output.y,
                        endX: this.finalOutput.x,
                        endY: this.finalOutput.y,
                        progress: 0,
                        speed: 0.005,
                        color: '#ff3333',
                        radius: 6,
                        stage: 2
                    });
                    
                    this.signals.push({
                        startX: this.bias2.x,
                        startY: this.bias2.y,
                        endX: this.finalOutput.x,
                        endY: this.finalOutput.y,
                        progress: 0,
                        speed: 0.005,
                        color: '#ff3333',
                        radius: 6,
                        stage: 2
                    });
                }
            }
        }
        
        // If all signals are done and flash is done, stop the animation
        if (this.signals.length === 0 && !this.sigmoidFlash && !this.firstSpawn) {
            this.isAnimating = false;
            this.draw();
            return;
        }
        
        // Continue animation
        this.draw();
        this.animationFrameId = requestAnimationFrame(() => this.animate());
    }

    updateCalculationDisplay() {
        const el = document.getElementById('calc2');
        if (!el) return;
        const { i1, i2 } = getInputValues();
        const w1 = parseFloat(this.w_input1_hidden);
        const w2 = parseFloat(this.w_input2_hidden);
        const wb = parseFloat(this.w_bias_hidden);
        const hidden = i1 * w1 + i2 * w2 + 1 * wb;
        const w_out = parseFloat(this.w_output_final);
        const wb2 = parseFloat(this.w_bias2_final);
        const final = hidden * w_out + 1 * wb2;
        const lines = [];
        lines.push(`Stage1: Hidden = (Input1 × ${w1}) + (Input2 × ${w2}) + (Bias × ${wb})`);
        lines.push(`Calculation: (${i1}×${w1}) + (${i2}×${w2}) + (1×${wb}) = ${hidden.toFixed(3)}`);
        lines.push('');
        lines.push(`Stage2: Final = (Hidden × ${w_out}) + (Bias2 × ${wb2})`);
        lines.push(`Calculation: (${hidden.toFixed(3)}×${w_out}) + (1×${wb2}) = ${final.toFixed(3)}`);
        el.textContent = lines.join('\n');
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#f9f9f9';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw Stage 1 connection lines
        this.ctx.strokeStyle = '#ccc';
        this.ctx.lineWidth = 2;
        
        // Line from input1 to output
        this.ctx.beginPath();
        this.ctx.moveTo(this.input1.x, this.input1.y);
        this.ctx.lineTo(this.output.x, this.output.y);
        this.ctx.stroke();
        // draw weight
        this.ctx.fillStyle = '#333';
        this.ctx.font = '12px sans-serif';
        let mx = (this.input1.x + this.output.x) / 2;
        let my = (this.input1.y + this.output.y) / 2 - 8;
        this.ctx.fillText(this.w_input1_hidden, mx, my);
        
        // Line from input2 to output
        this.ctx.beginPath();
        this.ctx.moveTo(this.input2.x, this.input2.y);
        this.ctx.lineTo(this.output.x, this.output.y);
        this.ctx.stroke();
        mx = (this.input2.x + this.output.x) / 2;
        my = (this.input2.y + this.output.y) / 2 + 8;
        this.ctx.fillText(this.w_input2_hidden, mx, my);
        
        // Line from bias to output
        this.ctx.beginPath();
        this.ctx.moveTo(this.bias.x, this.bias.y);
        this.ctx.lineTo(this.output.x, this.output.y);
        this.ctx.stroke();
        mx = (this.bias.x + this.output.x) / 2 - 6;
        my = (this.bias.y + this.output.y) / 2 - 6;
        this.ctx.fillText(this.w_bias_hidden, mx, my);
        
        // Draw Stage 2 connection lines (if stage 2 is active)
        if (this.stage === 2) {
            // Line from output to final output
            this.ctx.beginPath();
            this.ctx.moveTo(this.output.x, this.output.y);
            this.ctx.lineTo(this.finalOutput.x, this.finalOutput.y);
            this.ctx.stroke();
            mx = (this.output.x + this.finalOutput.x) / 2;
            my = (this.output.y + this.finalOutput.y) / 2;
            this.ctx.fillText(this.w_output_final, mx, my - 8);
            
            // Line from bias2 to final output
            this.ctx.beginPath();
            this.ctx.moveTo(this.bias2.x, this.bias2.y);
            this.ctx.lineTo(this.finalOutput.x, this.finalOutput.y);
            this.ctx.stroke();
            mx = (this.bias2.x + this.finalOutput.x) / 2;
            my = (this.bias2.y + this.finalOutput.y) / 2 - 6;
            this.ctx.fillText(this.w_bias2_final, mx, my);
        }
        
        // Draw input neurons
        this.ctx.fillStyle = '#e8e8e8';
        this.ctx.strokeStyle = '#667eea';
        this.ctx.lineWidth = 2;
        
        this.ctx.beginPath();
        this.ctx.arc(this.input1.x, this.input1.y, this.input1.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.arc(this.input2.x, this.input2.y, this.input2.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Draw bias circle
        this.ctx.fillStyle = '#fff3e0';
        this.ctx.strokeStyle = '#ff9800';
        this.ctx.lineWidth = 2;
        
        this.ctx.beginPath();
        this.ctx.arc(this.bias.x, this.bias.y, this.bias.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Draw output neuron with sigmoid flash effect (double blink)
        let isFlashing = false;
        if (this.sigmoidFlash) {
            // Create double blink effect: on for first 20 frames, off for 10, on for 20, off for remaining
            const cyclePosition = this.sigmoidFlash.duration % 50;
            isFlashing = (cyclePosition > 30) || (cyclePosition > 10 && cyclePosition < 30);
        }
        
        this.ctx.fillStyle = isFlashing ? '#ffcccc' : '#e8e8e8';
        this.ctx.strokeStyle = '#667eea';
        this.ctx.lineWidth = 2;
        
        this.ctx.beginPath();
        this.ctx.arc(this.output.x, this.output.y, this.output.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Draw stage 2 elements if active
        if (this.stage === 2) {
            // Draw bias 2 circle
            this.ctx.fillStyle = '#fff3e0';
            this.ctx.strokeStyle = '#ff9800';
            this.ctx.lineWidth = 2;
            
            this.ctx.beginPath();
            this.ctx.arc(this.bias2.x, this.bias2.y, this.bias2.radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
            
            // Draw final output neuron
            this.ctx.fillStyle = '#e8e8e8';
            this.ctx.strokeStyle = '#667eea';
            this.ctx.lineWidth = 2;
            
            this.ctx.beginPath();
            this.ctx.arc(this.finalOutput.x, this.finalOutput.y, this.finalOutput.radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
        }
        
        // Draw signals (red dots, no glow)
        this.ctx.fillStyle = '#ff3333';
        this.signals.forEach(signal => {
            const x = signal.startX + (signal.endX - signal.startX) * signal.progress;
            const y = signal.startY + (signal.endY - signal.startY) * signal.progress;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, signal.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Draw labels
        this.ctx.fillStyle = '#333';
        this.ctx.font = 'bold 14px sans-serif';
        this.ctx.textAlign = 'center';
        
        this.ctx.fillText('Input 1', this.input1.x, this.input1.y + 40);
        this.ctx.fillText('Input 2', this.input2.x, this.input2.y + 40);
        this.ctx.fillText('Bias', this.bias.x, this.bias.y + 30);
        this.ctx.fillText('Hidden Output', this.output.x, this.output.y + 40);
        
        if (this.stage === 2) {
            this.ctx.fillText('Bias 2', this.bias2.x, this.bias2.y + 30);
            this.ctx.fillText('Final Output', this.finalOutput.x, this.finalOutput.y + 40);
            
            // Draw sigmoid label
            this.ctx.fillStyle = '#666';
            this.ctx.font = 'italic 12px sans-serif';
            this.ctx.fillText('sigmoid()', (this.output.x + this.finalOutput.x) / 2, (this.output.y + this.finalOutput.y) / 2 - 20);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const viz1 = new Layer1Visualization('networkCanvas1');
    const viz2 = new Layer2Visualization('networkCanvas2');
    
    // Layer 1 controls
    document.getElementById('startBtn1').addEventListener('click', () => viz1.start());
    document.getElementById('stopBtn1').addEventListener('click', () => viz1.stop());
    document.getElementById('resetBtn1').addEventListener('click', () => viz1.reset());
    
    // Layer 2 controls
    document.getElementById('startBtn2').addEventListener('click', () => viz2.start());
    document.getElementById('stopBtn2').addEventListener('click', () => viz2.stop());
    document.getElementById('resetBtn2').addEventListener('click', () => viz2.reset());
    
    const viz3 = new Layer3Visualization('networkCanvas3');
    
    // Layer 3 controls
    document.getElementById('startBtn3').addEventListener('click', () => viz3.start());
    document.getElementById('stopBtn3').addEventListener('click', () => viz3.stop());
    document.getElementById('resetBtn3').addEventListener('click', () => viz3.reset());
    
    // Update calculation displays when inputs change
    const in1 = document.getElementById('inputVal1');
    const in2 = document.getElementById('inputVal2');
    function updateAllCalc() {
        viz1.updateCalculationDisplay && viz1.updateCalculationDisplay();
        viz2.updateCalculationDisplay && viz2.updateCalculationDisplay();
        viz3.updateCalculationDisplay && viz3.updateCalculationDisplay();
    }
    if (in1 && in2) {
        in1.addEventListener('input', updateAllCalc);
        in2.addEventListener('input', updateAllCalc);
    }
    // Initialize calculation displays
    updateAllCalc();
});
