document.getElementById("csvFile").addEventListener("change", handleFileUpload);

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        Papa.parse(e.target.result, {
            complete: function (results) {
                drawLabels(results.data);
            },
        });
    };
    reader.readAsText(file);
}

function drawLabels(data) {
    const canvas = document.getElementById("labelsCanvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.font = "90px Arial"; // Adjusted for better text fitting
    ctx.textAlign = "center";  
    ctx.textBaseline = "middle"; 

    const columns = 3;
    const rows = 8;
    const labelWidth = canvas.width / columns;
    const labelHeight = canvas.height / rows;
    const maxLineWidth = labelWidth * 0.9; // Leave some margin

    data.forEach((row, index) => {
        let col = index % columns;
        let rowNum = Math.floor(index / columns);

        if (rowNum >= rows) return; // Prevent extra rows

        let x = col * labelWidth + labelWidth / 2;  
        let y = rowNum * labelHeight + labelHeight / 2; 

        let text = Object.values(row).join(" ");
        let lines = wrapText(ctx, text, maxLineWidth);

        let lineHeight = 70; // Line spacing
        let startY = y - (lines.length - 1) * lineHeight / 2; // Center the text block

        lines.forEach((line, i) => {
            ctx.fillText(line, x, startY + i * lineHeight);
        });
    });
}

function wrapText(ctx, text, maxWidth) {
    let words = text.split(" ");
    let lines = [];
    let currentLine = "";

    words.forEach(word => {
        let testLine = currentLine ? currentLine + " " + word : word;
        let testWidth = ctx.measureText(testLine).width;

        if (testWidth > maxWidth) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    });

    if (currentLine) lines.push(currentLine);
    return lines;
}

function downloadCanvas() {
    const canvas = document.getElementById("labelsCanvas");
    const link = document.createElement("a");
    link.download = "labels.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
}

function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "mm", "a4");
    const canvas = document.getElementById("labelsCanvas");

    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
    pdf.save("labels.pdf");
}
