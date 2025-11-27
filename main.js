const carouselData = [{
    category: "UG",
    img: "https://static.wixstatic.com/media/d77f36_deddd99f45db4a55953835f5d3926246~mv2.png",
    title: "Undergraduate",
    text: "Bachelor-level opportunities."
}, {
    category: "PG",
    img: "https://static.wixstatic.com/media/d77f36_ae2a1e8b47514fb6b0a995be456a9eec~mv2.png",
    title: "Postgraduate",
    text: "Master's and advanced programs."
}, {
    category: "Diploma",
    img: "https://static.wixstatic.com/media/d77f36_e8f60f4350304ee79afab3978a44e307~mv2.png",
    title: "Diploma",
    text: "Professional and foundation."
}, {
    category: "Mobility",
    img: "https://static.wixstatic.com/media/d77f36_1118d15eee5a45f2a609c762d077857e~mv2.png",
    title: "Semester Abroad",
    text: "Exchange and mobility."
}, {
    category: "Upskilling",
    img: "https://static.wixstatic.com/media/d77f36_d8d9655ba23f4849abba7d09ddb12092~mv2.png",
    title: "Upskilling",
    text: "Short-term training."
}, {
    category: "Research",
    img: "https://static.wixstatic.com/media/d77f36_aa9eb498381d4adc897522e38301ae6f~mv2.jpg",
    title: "Research",
    text: "Opportunities &amp; links."
}];

function populateCarousel() {
    const container = document.getElementById('carouselContainer');
    carouselData.forEach(item => {
        const cardHTML = `
            <a href="#" class="carousel-card" data-category="${item.category}">
                <img src="${item.img}" alt="${item.title}"/>
                <div class="carousel-card-content">
                    <div class="carousel-card-title">${item.title}</div>
                    <div class="carousel-card-text">${item.text}</div>
                </div>
            </a>`;
        container.innerHTML += cardHTML;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    populateCarousel();
    document.querySelectorAll('.carousel-card').forEach(card => {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.carousel-card').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            highlightCountriesByProgram(this.dataset.category);
            highlightNeuralCubesByProgram(this.dataset.category);
        });
    });
    document.querySelector('.carousel-card[data-category="UG"]').classList.add('selected');
});

function scrollCarousel(direction) {
    const container = document.getElementById('carouselContainer');
    const card = container.querySelector('.carousel-card');
    let cardWidth = card.offsetWidth;
    container.scrollBy({
        left: direction * (cardWidth + 16),
        behavior: 'smooth'
    });
}

let isRotationPaused = false,
    isCubeMovementPaused = false;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.001, 1000);
camera.position.z = 3.5;
const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.domElement.id = 'threejs-canvas';
const GLOBE_RADIUS = 1.0;
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.enablePan = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.6;
controls.minDistance = 0.01;
controls.maxDistance = 15.0;

let isInteracting = false,
    hoverTimeout;
renderer.domElement.addEventListener('mousedown', () => {
    isInteracting = true;
    clearTimeout(hoverTimeout);
});
renderer.domElement.addEventListener('mouseup', () => {
    hoverTimeout = setTimeout(() => {
        isInteracting = false;
    }, 200);
});

function updateCanvasSize() {
    const headerHeight = document.querySelector('.header-ui-bar').offsetHeight;
    const footerHeight = document.querySelector('.footer-ui-bar').offsetHeight;
    const canvas = renderer.domElement;
    const newHeight = window.innerHeight - headerHeight - footerHeight;
    canvas.style.top = `${headerHeight}px`;
    canvas.style.height = `${newHeight}px`;
    renderer.setSize(window.innerWidth, newHeight);
    camera.aspect = window.innerWidth / newHeight;
    camera.updateProjectionMatrix();
}
scene.add(new THREE.AmbientLight(0x88ccff, 1.5));
const pointLight = new THREE.PointLight(0xffffff, 1.5);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);
const globeGroup = new THREE.Group();
scene.add(globeGroup);
const transformControls = new THREE.TransformControls(camera, renderer.domElement);
transformControls.setMode('translate');
transformControls.addEventListener('dragging-changed', event => {
    if (controls) controls.enabled = !event.value;
});
transformControls.visible = false;
scene.add(transformControls);

// --- START: Updated Pan/Drag Controls for Desktop and Mobile ---
let isPanMode = false;

// Set up the default mouse and touch controls
controls.mouseButtons = {
	LEFT: THREE.MOUSE.ROTATE,
	MIDDLE: THREE.MOUSE.DOLLY,
	RIGHT: THREE.MOUSE.PAN
};

controls.touches = {
	ONE: THREE.TOUCH.ROTATE,
	TWO: THREE.TOUCH.DOLLY_PAN
};

function togglePanMode() {
    isPanMode = !isPanMode;
    const panButton = document.getElementById('btn-pan');
    const canvas = renderer.domElement;

    if (isPanMode) {
        // --- Activate Pan Mode ---
        controls.mouseButtons.LEFT = THREE.MOUSE.PAN; // Mouse: Left button now pans
        controls.touches.ONE = THREE.TOUCH.PAN;      // Touch: One finger now pans

        panButton.classList.add('pan-mode');
        panButton.title = 'Switch to Rotate Mode';
        canvas.style.cursor = 'grab';

    } else {
        // --- Deactivate Pan Mode (Return to Rotate) ---
        controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE; // Mouse: Left button returns to rotate
        controls.touches.ONE = THREE.TOUCH.ROTATE;      // Touch: One finger returns to rotate

        panButton.classList.remove('pan-mode');
        panButton.title = 'Switch to Pan/Move Mode';
        canvas.style.cursor = 'default';
    }
}

// Attach the function to the button click
document.getElementById('btn-pan').addEventListener('click', togglePanMode);

// Event listeners for cursor style change on desktop
renderer.domElement.addEventListener('mousedown', () => {
    if (isPanMode) renderer.domElement.style.cursor = 'grabbing';
});
renderer.domElement.addEventListener('mouseup', () => {
    if (isPanMode) renderer.domElement.style.cursor = 'grab';
});
// --- END: Updated Pan/Drag Controls ---

function getColorByData(data) {
    const baseHue = data.domain * 30 % 360;
    const lightness = 50 + data.engagement * 25;
    const saturation = 70;
    const riskShift = data.risk > 0.5 ? 0 : 120;
    const hue = (baseHue + riskShift) % 360;
    const color = new THREE.Color(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    color.multiplyScalar(data.confidence);
    return color;
}

function createTexture(text, logoUrl, bgColor = '#003366') {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    const texture = new THREE.CanvasTexture(canvas);

    function drawText() {
        const lines = text.split('\n');
        const fontSize = lines.length > 1 ? 28 : 32;
        ctx.font = `bold ${fontSize}px Arial`;
        let y = 128 + (lines.length > 1 ? 0 : 10);
        lines.forEach(line => {
            ctx.fillText(line, 128, y);
            y += (fontSize + 6);
        });
        texture.needsUpdate = true;
    }
    if (logoUrl) {
        const logoImg = new Image();
        logoImg.crossOrigin = "Anonymous";
        logoImg.src = logoUrl;
        logoImg.onload = () => {
            ctx.drawImage(logoImg, 16, 16, 64, 64);
            drawText();
        };
        logoImg.onerror = () => {
            drawText();
        }
    } else {
        drawText();
    }
    return new THREE.MeshStandardMaterial({
        map: texture,
        emissive: new THREE.Color(bgColor),
        emissiveIntensity: 0.6
    });
}
let europeCube, newThailandCube, canadaCube, ukCube, usaCube, indiaCube, singaporeCube, malaysiaCube;
const europeSubCubes = [],
    newThailandSubCubes = [],
    canadaSubCubes = [],
    ukSubCubes = [],
    usaSubCubes = [],
    indiaSubCubes = [],
    singaporeSubCubes = [],
    malaysiaSubCubes = [];
const explodedPositions = [],
    newThailandExplodedPositions = [],
    canadaExplodedPositions = [],
    ukExplodedPositions = [],
    usaExplodedPositions = [],
    indiaExplodedPositions = [],
    singaporeExplodedPositions = [],
    malaysiaExplodedPositions = [];
const explodedSpacing = 0.1;
let isEuropeCubeExploded = false,
    isNewThailandCubeExploded = false,
    isCanadaCubeExploded = false,
    isUkCubeExploded = false,
    isUsaCubeExploded = false,
    isIndiaCubeExploded = false,
    isSingaporeCubeExploded = false,
    isMalaysiaCubeExploded = false;
const europeContent = [
  {
    university: "Sorbonne University",
    logo: "https://upload.wikimedia.org/wikipedia/en/6/6e/Sorbonne_University.png",
    erasmusLink: "https://www.sorbonne-universite.fr/en/international",
    programName: "Liberal Arts & Sciences",
    programLink: "https://www.sorbonne-universite.fr/en/admissions",
    applyLink: "https://rajaratnams.wixsite.com/canadian-study-cente"
  },
  null, null, null,
  {
    university: "Technical University of Munich",
    logo: "https://upload.wikimedia.org/wikipedia/en/7/74/Tum_logo_blue_rgb.svg",
    erasmusLink: "https://www.international.tum.de/en/global/erasmus/",
    programName: "Engineering (Erasmus+)",
    programLink: "https://www.tum.de/en/studies/application-and-acceptance/",
    applyLink: "https://rajaratnams.wixsite.com/canadian-study-cente"
  },
  null, null, null,
  {
    university: "University of Barcelona",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/56/Logotipo_UB.svg",
    erasmusLink: "https://www.ub.edu/uri/estudiantsNOUB/eng/erasmus.htm",
    programName: "Humanities Exchange",
    programLink: "https://www.ub.edu/web/ub/en/",
    applyLink: "https://rajaratnams.wixsite.com/canadian-study-cente"
  },
  null, null, null, null, null, null, null, null, null, null, null, null, null, null, null
];

const newThailandContent = [
  {
    university: "Chulalongkorn University",
    logo: "https://upload.wikimedia.org/wikipedia/en/9/9d/Chulalongkorn_University_Logo.png",
    programName: "International Business",
    programLink: "https://www.chula.ac.th/en/admissions/",
    applyLink: "https://rajaratnams.wixsite.com/canadian-study-cente"
  },
  null, null, null,
  {
    university: "Mahidol University",
    logo: "https://upload.wikimedia.org/wikipedia/en/2/2e/Mahidol_University_seal.png",
    programName: "Health Sciences Exchange",
    programLink: "https://graduate.mahidol.ac.th/inter/?p=exchange",
    applyLink: "https://rajaratnams.wixsite.com/canadian-study-cente"
  },
  null, null, null,
  {
    university: "Thammasat University",
    logo: "https://upload.wikimedia.org/wikipedia/en/3/36/Thammasat_University_Seal.png",
    programName: "International Economics",
    programLink: "https://www.tu.ac.th/en/",
    applyLink: "https://rajaratnams.wixsite.com/canadian-study-cente"
  },
  null, null, null, null, null, null, null, null, null, null, null, null, null, null, null
];

const canadaContent = [{
    university: "Trinity Western University",
    logo: "https://static.wixstatic.com/media/d77f36_b14379dfcff54ffcad6ed7b604debd6f~mv2.png",
    programName: "BSN",
    programLink: "https://www.twu.ca/academics/school-nursing/nursing-bsn",
    applyLink: "https://rajaratnams.wixsite.com/canadian-study-cente"
}, {
    university: "Trinity Western University",
    logo: "https://static.wixstatic.com/media/d77f36_b14379dfcff54ffcad6ed7b604debd6f~mv2.png",
    programName: "MSN",
    programLink: "https://www.twu.ca/academics/school-nursing/nursing-msn",
     applyLink: "https://rajaratnams.wixsite.com/canadian-study-cente"
}, {
    university: "Trinity Western University",
    logo: "https://static.wixstatic.com/media/d77f36_b14379dfcff54ffcad6ed7b604debd6f~mv2.png",
    programName: "Biotechnology",
    programLink: "https://www.twu.ca/academics/faculty-natural-applied-sciences/biotechnology",
     applyLink: "https://rajaratnams.wixsite.com/canadian-study-cente"
}, {
    university: "Trinity Western University",
    logo: "https://static.wixstatic.com/media/d77f36_b14379dfcff54ffcad6ed7b604debd6f~mv2.png",
    programName: "Computing Science",
    programLink: "https://www.twu.ca/academics/faculty-natural-applied-sciences/computing-science",
     applyLink: "https://rajaratnams.wixsite.com/canadian-study-cente"
}, {
    university: "Trinity Western University",
    logo: "https://static.wixstatic.com/media/d77f36_b14379dfcff54ffcad6ed7b604debd6f~mv2.png",
    programName: "MA in Leadership",
    programLink: "https://www.twu.ca/academics/graduate-studies/leadership-ma",
     applyLink: "https://rajaratnams.wixsite.com/canadian-study-cente"
}, {
    university: "Trinity Western University",
    logo: "https://static.wixstatic.com/media/d77f36_b14379dfcff54ffcad6ed7b604debd6f~mv2.png",
    programName: "MBA",
    programLink: "https://www.twu.ca/academics/school-business/master-business-administration",
     applyLink: "https://rajaratnams.wixsite.com/canadian-study-cente"
}, {
    university: "Trinity Western University",
    logo: "https://static.wixstatic.com/media/d77f36_b14379dfcff54ffcad6ed7b604debd6f~mv2.png",
    programName: "BBA",
    programLink: "https://www.twu.ca/academics/school-business/bachelor-business-administration",
      applyLink: "https://rajaratnams.wixsite.com/canadian-study-cente"
}, {
    university: "Wawiwa Tech Training",
    logo: "https://static.wixstatic.com/media/d77f36_0d83ad97a7e54b2db3f0eb089dbcec1f~mv2.webp",
    programName: "Cyber Security",
    programLink: "#",
     applyLink: "https://rajaratnams.wixsite.com/canadian-study-cente"
}, {
    university: "Wawiwa Tech Training",
    logo: "https://static.wixstatic.com/media/d77f36_0d83ad97a7e54b2db3f0eb089dbcec1f~mv2.webp",
    programName: "Data Analytics",
    programLink: "#",
      applyLink: "https://rajaratnams.wixsite.com/canadian-study-cente"
}, {
    university: "Wawiwa Tech Training",
    logo: "https://static.wixstatic.com/media/d77f36_0d83ad97a7e54b2db3f0eb089dbcec1f~mv2.webp",
    programName: "Full Stack Dev",
    programLink: "#",
     applyLink: "https://rajaratnams.wixsite.com/canadian-study-cente"
}, {
    university: "Wawiwa Tech Training",
    logo: "https://static.wixstatic.com/media/d77f36_0d83ad97a7e54b2db3f0eb089dbcec1f~mv2.webp",
    programName: "UX/UI Design",
    programLink: "#",
      applyLink: "https://rajaratnams.wixsite.com/canadian-study-cente"
}, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null];
const ukContent = [
  {
    university: "University of Oxford",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/4a/Oxford_University_Coat_Of_Arms.png",
    programName: "Mathematics Exchange",
    programLink: "https://www.ox.ac.uk/admissions/undergraduate/courses-listing/mathematics",
    applyLink: "https://rajaratnams.wixsite.com/canadian-study-cente"
  },
  null, null, null,
  {
    university: "University of Manchester",
    logo: "https://upload.wikimedia.org/wikipedia/en/7/7b/University_of_Manchester_coat_of_arms.png",
    programName: "Computer Science",
    programLink: "https://www.manchester.ac.uk/study/international/why-manchester/student-exchanges/",
    applyLink: "https://rajaratnams.wixsite.com/canadian-study-cente"
  },
  null, null, null,
  {
    university: "University of Glasgow",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/50/University_of_Glasgow_coat_of_arms.svg",
    programName: "Economics Mobility",
    programLink: "https://www.gla.ac.uk/explore/erasmus/",
    applyLink: "https://rajaratnams.wixsite.com/canadian-study-cente"
  },
  null, null, null, null, null, null, null, null, null, null, null, null, null, null, null
];

const usaContent = [{
    university: "John Cabot University",
    logo: "https://static.wixstatic.com/media/d77f36_4711ccd9b626480b929186e41e64ee28~mv2.png",
    programName: "Degree\nPrograms",
    programLink: "https://www.jcu.edu/program-finder",
      applyLink: "https://rajaratnams.wixsite.com/canadian-study-cente"
}, {
    university: "John Cabot University",
    logo: "https://static.wixstatic.com/media/d77f36_4711ccd9b626480b929186e41e64ee28~mv2.png",
    programName: "Study Abroad",
    programLink: "https://www.jcu.edu/academics/global-experiences",
     applyLink: "https://rajaratnams.wixsite.com/canadian-study-cente"
}, {
    university: "St. Mary's University",
    logo: "https://static.wixstatic.com/media/d77f36_8fda624fd9634997a589119b22051ac8~mv2.png",
    programName: "STEM\nPrograms",
    programLink: "https://www.stmarytx.edu/academics/programs/computer-science/",
      applyLink: "https://rajaratnams.wixsite.com/canadian-study-cente"
}, {
    university: "St. Mary's University",
    logo: "https://static.wixstatic.com/media/d77f36_8fda624fd9634997a589119b22051ac8~mv2.png",
    programName: "Int'l Services",
    programLink: "https://www.stmarytx.edu/campuslife/international/",
      applyLink: "https://rajaratnams.wixsite.com/canadian-study-cente"
}, {
    university: "California Baptist University",
    logo: "https://static.wixstatic.com/shapes/d77f36_efa51305eeef47e2b02a13e35d17e251.svg",
    programName: "STEM\nDegrees",
    programLink: "https://calbaptist.edu/admissions-aid/international/stem",
      applyLink: "https://rajaratnams.wixsite.com/canadian-study-cente"
}, {
    university: "California Baptist University",
    logo: "https://static.wixstatic.com/shapes/d77f36_efa51305eeef47e2b02a13e35d17e251.svg",
    programName: "Int'l Exchange",
    programLink: "https://calbaptist.edu/admissions-aid/international/international-programs/",
     applyLink: "https://rajaratnams.wixsite.com/canadian-study-cente"
}, {
    university: "LeTourneau University",
    logo: "https://static.wixstatic.com/media/d77f36_2f89b58cab8349eabfafae4ee16e68a2~mv2.png",
    programName: "Aviation",
    programLink: "https://www.letu.edu/academics/aviation/index.html",
     applyLink: "https://rajaratnams.wixsite.com/canadian-study-cente"
}, {
    university: "LeTourneau University",
    logo: "https://static.wixstatic.com/media/d77f36_2f89b58cab8349eabfafae4ee16e68a2~mv2.png",
    programName: "Engineering",
    programLink: "https://www.letu.edu/academics/engineering/index.html",
     applyLink: "https://rajaratnams.wixsite.com/canadian-study-cente"
}, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null];
const indiaContent = [{
    university: "Asia College of Journalism",
    logo: "https://static.wixstatic.com/media/d77f36_2cd674a2255f4d3f83d8b00721d6f477~mv2.png",
    programName: "Journalism",
    programLink: "https://www.asianmedia.org.in/bloomberg/",
      applyLink: "https://rajaratnams.wixsite.com/canadian-study-cente"
}, {
    university: "Women's Christian College",
    logo: "https://static.wixstatic.com/media/d77f36_2c637647ae7145749c1a7d3f74ec6f2e~mv2.jpg",
    programName: "Academic\nPrograms",
    programLink: "https://wcc.edu.in/programmes-offered/",
      applyLink: "https://rajaratnams.wixsite.com/canadian-study-cente"
}, {
    university: "Stella Maris College",
    logo: "https://static.wixstatic.com/media/d77f36_e7d55cc621e54077b0205581f5323175~mv2.png",
    programName: "PG Prospectus",
     applyLink: "https://rajaratnams.wixsite.com/canadian-study-cente"
}, {
    university: "Stella Maris College",
    logo: "https://static.wixstatic.com/media/d77f36_e7d55cc621e54077b0205581f5323175~mv2.png",
    programName: "Exchange",
    programLink: "https://networkdemo.in/educationwp/",
     applyLink: "https://rajaratnams.wixsite.com/canadian-study-cente"
}, {
    university: "Symbiosis International University",
    logo: "https://static.wixstatic.com/media/d77f36_f89cf22ecc514a78b0dd8b34c656d4d9~mv2.png",
    programName: "Int'l\nAdmissions",
    programLink: "https://scie.ac.in/",
     applyLink: "https://rajaratnams.wixsite.com/canadian-study-cente"
}, {
    university: "Fergusson College",
    logo: "https://static.wixstatic.com/media/d77f36_60066c9c2c0242d39e0107a2f25eb185~mv2.png",
    programName: "Nursing",
    programLink: "https://desnursingcollege.edu.in/index.php",
    applyLink: "https://rajaratnams.wixsite.com/canadian-study-cente"
}, {
    university: "Bishop Heber College",
    logo: "https://static.wixstatic.com/media/d77f36_21e0208f1bc248e5953eff9a0410bad8~mv2.jpeg",
    programName: "Int'l\nAdmissions",
    programLink: "https://bhc.edu.in/bhc/int_admisssion.php",
     applyLink: "https://rajaratnams.wixsite.com/canadian-study-cente"
}, {
    university: "St. Stephen's College",
    logo: "https://static.wixstatic.com/media/d77f36_e4e8e1e417874b01b46adf1aadc894be~mv2.png",
    programName: "Courses\nOffered",
    programLink: "https://www.ststephens.edu/courses-offered/",
      applyLink: "https://rajaratnams.wixsite.com/canadian-study-cente"
}, {
    university: "Christ University",
    logo: "https://static.wixstatic.com/media/d77f36_88239521c71f4ad8bcb8e986e7b14ac7~mv2.webp",
    programName: "Int'l\nAdmissions",
    programLink: "https://christuniversity.in/international-student-category",
      applyLink: "https://rajaratnams.wixsite.com/canadian-study-cente"
}, {
    university: "Christ University",
    logo: "https://static.wixstatic.com/media/d77f36_88239521c71f4ad8bcb8e986e7b14ac7~mv2.webp",
    programName: "Study Abroad",
    programLink: "https://christuniversity.in/international-relations",
     applyLink: "https://rajaratnams.wixsite.com/canadian-study-cente"
}, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null];
const singaporeContent = [{
    university: "NUS",
    logo: "https://static.wixstatic.com/media/d77f36_80b489ce45dd4d2494ec43dce3d88a7b~mv2.jpg",
    programName: "Business\nSchool",
    programLink: "https://bschool.nus.edu.sg/",
    applyLink: "https://rajaratnams.wixsite.com/canadian-study-cente"
}, {
    university: "NUS",
    logo: "https://static.wixstatic.com/media/d77f36_80b489ce45dd4d2494ec43dce3d88a7b~mv2.jpg",
    programName: "Nursing &amp;\nMedicine",
    programLink: "https://medicine.nus.edu.sg/our-programmes/",
     applyLink: "https://rajaratnams.wixsite.com/canadian-study-cente"
}, {
    university: "NUS",
    logo: "https://static.wixstatic.com/media/d77f36_80b489ce45dd4d2494ec43dce3d88a7b~mv2.jpg",
    programName: "Public Policy",
    programLink: "https://lkyspp.nus.edu.sg/",
   applyLink: "https://rajaratnams.wixsite.com/canadian-study-cente"
}, {
    university: "SIM",
    logo: "https://static.wixstatic.com/media/d77f36_f2d0805ccb934e8da2019aaf23b16e6f~mv2.avif",
    programName: "IT &amp;\nCompSci",
    programLink: "https://www.sim.edu.sg/degrees-diplomas/programmes/disciplines/it-computer-science",
    applyLink: "https://rajaratnams.wixsite.com/canadian-study-cente"
}, {
    university: "SIM",
    logo: "https://static.wixstatic.com/media/d77f36_f2d0805ccb934e8da2019aaf23b16e6f~mv2.avif",
    programName: "Nursing",
    programLink: "https://www.sim.edu.sg/degrees-diplomas/programmes/disciplines/nursing",
    applyLink: "https://rajaratnams.wixsite.com/canadian-study-cente"
}, {
    university: "Nanyang Institute of Management",
    logo: "https://static.wixstatic.com/media/d77f36_e219748ff80a417ea92e264199b7dfe3~mv2.png",
    programName: "Business",
    programLink: "https://nanyang.edu.sg/course/school-of-business/",
    applyLink: "https://rajaratnams.wixsite.com/canadian-study-cente"
}, {
    university: "Nanyang Institute of Management",
    logo: "https://static.wixstatic.com/media/d77f36_e219748ff80a417ea92e264199b7dfe3~mv2.png",
    programName: "Hospitality",
    programLink: "https://nanyang.edu.sg/course/school-of-business/",
    applyLink: "https://rajaratnams.wixsite.com/canadian-study-cente"
}, {
    university: "Nanyang Institute of Management",
    logo: "https://static.wixstatic.com/media/d77f36_e219748ff80a417ea92e264199b7dfe3~mv2.png",
    programName: "Digital Media\nDiploma",
    programLink: "https://nanyang.edu.sg/courses/advanced-diploma-in-digital-media-design-and-communication/",
    applyLink: "https://rajaratnams.wixsite.com/canadian-study-cente"
}, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null];
const malaysiaContent = [
  {
    university: "University of Malaya",
    logo: "https://upload.wikimedia.org/wikipedia/en/5/58/Coat_of_arms_of_the_University_of_Malaya.png",
    programName: "Science & Technology",
    programLink: "https://isc.um.edu.my/inbound-um-exchange-e",
    applyLink: "https://rajaratnams.wixsite.com/canadian-study-cente"
  },
  null, null, null,
  {
    university: "Taylor's University",
    logo: "https://upload.wikimedia.org/wikipedia/en/a/aa/Taylor%27s_University_logo.svg",
    programName: "Hospitality & Tourism",
    programLink: "https://university.taylors.edu.my/en/life-at-taylors/exchange-programmes.html",
    applyLink: "https://rajaratnams.wixsite.com/canadian-study-cente"
  },
  null, null, null,
  {
    university: "Universiti Putra Malaysia",
    logo: "https://upload.wikimedia.org/wikipedia/en/5/54/Coat_of_arms_of_Universiti_Putra_Malaysia.png",
    programName: "Life Sciences Exchange",
    programLink: "https://intl.upm.edu.my/?LANG=en",
    applyLink: "https://rajaratnams.wixsite.com/canadian-study-cente"
  }, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null];
const allUniversityContent = [...europeContent, ...newThailandContent, ...canadaContent, ...ukContent, ...usaContent, ...indiaContent, ...singaporeContent, ...malaysiaContent];

function createToggleFunction(cubeName) {
    return function() {
        let isExploded, setExploded, cube, subCubes, explodedPos;
        switch (cubeName) {
            case 'Europe':
                [isExploded, setExploded, cube, subCubes, explodedPos] = [isEuropeCubeExploded, s => isEuropeCubeExploded = s, europeCube, europeSubCubes, explodedPositions];
                break;
            case 'Thailand':
                [isExploded, setExploded, cube, subCubes, explodedPos] = [isNewThailandCubeExploded, s => isNewThailandCubeExploded = s, newThailandCube, newThailandSubCubes, newThailandExplodedPositions];
                break;
            case 'Canada':
                [isExploded, setExploded, cube, subCubes, explodedPos] = [isCanadaCubeExploded, s => isCanadaCubeExploded = s, canadaCube, canadaSubCubes, canadaExplodedPositions];
                break;
            case 'UK':
                [isExploded, setExploded, cube, subCubes, explodedPos] = [isUkCubeExploded, s => isUkCubeExploded = s, ukCube, ukSubCubes, ukExplodedPositions];
                break;
            case 'USA':
                [isExploded, setExploded, cube, subCubes, explodedPos] = [isUsaCubeExploded, s => isUsaCubeExploded = s, usaCube, usaSubCubes, usaExplodedPositions];
                break;
            case 'India':
                [isExploded, setExploded, cube, subCubes, explodedPos] = [isIndiaCubeExploded, s => isIndiaCubeExploded = s, indiaCube, indiaSubCubes, indiaExplodedPositions];
                break;
            case 'Singapore':
                [isExploded, setExploded, cube, subCubes, explodedPos] = [isSingaporeCubeExploded, s => isSingaporeCubeExploded = s, singaporeCube, singaporeSubCubes, singaporeExplodedPositions];
                break;
            case 'Malaysia':
                [isExploded, setExploded, cube, subCubes, explodedPos] = [isMalaysiaCubeExploded, s => isMalaysiaCubeExploded = s, malaysiaCube, malaysiaSubCubes, malaysiaExplodedPositions];
                break;
            default:
                return;
        }
        const shouldBeExploded = !isExploded;
        setExploded(shouldBeExploded);
        if (!cube) return;
        const targetPosition = new THREE.Vector3();
        if (shouldBeExploded) {
            cube.getWorldPosition(targetPosition);
            transformControls.attach(cube);
        } else {
            targetPosition.set(0, 0, 0);
            transformControls.detach();
        }
        new TWEEN.Tween(controls.target).to(targetPosition, 800).easing(TWEEN.Easing.Cubic.InOut).start();
        transformControls.visible = shouldBeExploded;
        subCubes.forEach((subCube, i) => {
            const targetPos = shouldBeExploded ? explodedPos[i] : subCube.userData.initialPosition;
            new TWEEN.Tween(subCube.position).to(targetPos, 800).easing(TWEEN.Easing.Exponential.InOut).start();
        });
    }
}
const toggleFunctionMap = {
    'Europe': createToggleFunction('Europe'),
    'Thailand': createToggleFunction('Thailand'),
    'Canada': createToggleFunction('Canada'),
    'UK': createToggleFunction('UK'),
    'USA': createToggleFunction('USA'),
    'India': createToggleFunction('India'),
    'Singapore': createToggleFunction('Singapore'),
    'Malaysia': createToggleFunction('Malaysia')
};
const neuronGroup = new THREE.Group();
globeGroup.add(neuronGroup);
const count = 150,
    maxRadius = 1.5,
    vortexCubeSize = 0.01,
    microGap = 0.002;
const velocities = [],
    cubes = [],
    dummyDataSet = [];
const neuralCubeMap = {};

function createNeuralCube(content, subCubeArray, explodedPositionArray, color) {
    let contentIdx = 0;
    const cubeObject = new THREE.Group();
    for (let xi = -1; xi <= 1; xi++)
        for (let yi = -1; yi <= 1; yi++)
            for (let zi = -1; zi <= 1; zi++) {
                const item = content[contentIdx];
                let material, userData;
                if (item) {
                    material = createTexture(item.programName, item.logo, color);
                    userData = item;
                } else {
                    material = createTexture('Unassigned', null, '#333333');
                    userData = {
                        university: "Unassigned"
                    };
                }
                const microcube = new THREE.Mesh(new THREE.BoxGeometry(vortexCubeSize, vortexCubeSize, vortexCubeSize), material);
                const pos = new THREE.Vector3(xi * (vortexCubeSize + microGap), yi * (vortexCubeSize + microGap), zi * (vortexCubeSize + microGap));
                microcube.position.copy(pos);
                microcube.userData = { ...userData,
                    isSubCube: true,
                    initialPosition: pos.clone()
                };
                subCubeArray.push(microcube);
                explodedPositionArray.push(new THREE.Vector3(xi * explodedSpacing, yi * explodedSpacing, zi * explodedSpacing));
                cubeObject.add(microcube);
                contentIdx++;
            }
    return cubeObject;
}
for (let i = 0; i < count; i++) {
    const r = maxRadius * Math.random(),
        theta = Math.random() * 2 * Math.PI,
        phi = Math.acos(2 * Math.random() - 1);
    const x = r * Math.sin(phi) * Math.cos(theta),
        y = r * Math.sin(phi) * Math.sin(theta),
        z = r * Math.cos(phi);
    let cubeObject;
    if (i === 0) {
        cubeObject = createNeuralCube(europeContent, europeSubCubes, explodedPositions, '#003366');
        cubeObject.userData.neuralName = 'Europe';
        europeCube = cubeObject;
    } else if (i === 1) {
        cubeObject = createNeuralCube(newThailandContent, newThailandSubCubes, newThailandExplodedPositions, '#A52A2A');
        cubeObject.userData.neuralName = 'Thailand';
        newThailandCube = cubeObject;
    } else if (i === 2) {
        cubeObject = createNeuralCube(canadaContent, canadaSubCubes, canadaExplodedPositions, '#006400');
        cubeObject.userData.neuralName = 'Canada';
        canadaCube = cubeObject;
    } else if (i === 3) {
        cubeObject = createNeuralCube(ukContent, ukSubCubes, ukExplodedPositions, '#483D8B');
        cubeObject.userData.neuralName = 'UK';
        ukCube = cubeObject;
    } else if (i === 4) {
        cubeObject = createNeuralCube(usaContent, usaSubCubes, usaExplodedPositions, '#B22234');
        cubeObject.userData.neuralName = 'USA';
        usaCube = cubeObject;
    } else if (i === 5) {
        cubeObject = createNeuralCube(indiaContent, indiaSubCubes, indiaExplodedPositions, '#FF9933');
        cubeObject.userData.neuralName = 'India';
        indiaCube = cubeObject;
    } else if (i === 6) {
        cubeObject = createNeuralCube(singaporeContent, singaporeSubCubes, singaporeExplodedPositions, '#EE2536');
        cubeObject.userData.neuralName = 'Singapore';
        singaporeCube = cubeObject;
    } else if (i === 7) {
        cubeObject = createNeuralCube(malaysiaContent, malaysiaSubCubes, malaysiaExplodedPositions, '#FFD700');
        cubeObject.userData.neuralName = 'Malaysia';
        malaysiaCube = cubeObject;
    } else {
        cubeObject = new THREE.Group();
        const data = {
            domain: i % 12,
            engagement: Math.random(),
            age: Math.random(),
            risk: Math.random(),
            confidence: 0.7 + Math.random() * 0.3
        };
        dummyDataSet.push(data);
        const color = getColorByData(data);
        const subCubeMaterial = new THREE.MeshStandardMaterial({
            color,
            emissive: color,
            emissiveIntensity: 0.6,
            transparent: true,
            opacity: 1.0
        });
        const microcube = new THREE.Mesh(new THREE.BoxGeometry(vortexCubeSize, vortexCubeSize, vortexCubeSize), subCubeMaterial);
        cubeObject.add(microcube);
        cubeObject.userData.isSmallNode = true;
    }
    cubeObject.position.set(x, y, z);
    neuronGroup.add(cubeObject);
    cubes.push(cubeObject);
    velocities.push(new THREE.Vector3((Math.random() - 0.5) * 0.002, (Math.random() - 0.5) * 0.002, (Math.random() - 0.5) * 0.002));
    if (cubeObject.userData.neuralName) {
        neuralCubeMap[cubeObject.userData.neuralName] = cubeObject;
    }
}
let neuralNetworkLines;

function createNeuralNetwork() {
    const vertices = [];
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const material = new THREE.LineBasicMaterial({
        color: 0x00BFFF,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.35
    });
    neuralNetworkLines = new THREE.LineSegments(geometry, material);
    globeGroup.add(neuralNetworkLines);
}
createNeuralNetwork();
new THREE.TextureLoader().load("https://static.wixstatic.com/media/d77f36_8f868995fda643a0a61562feb20eb733~mv2.jpg", (tex) => {
    const globe = new THREE.Mesh(new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64), new THREE.MeshPhongMaterial({
        map: tex,
        transparent: true,
        opacity: 0.28
    }));
    globeGroup.add(globe);
});
let wireframeMesh = new THREE.Mesh(new THREE.SphereGeometry(GLOBE_RADIUS + 0.05, 64, 64), new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    wireframe: true,
    transparent: true,
    opacity: 0.12
}));
globeGroup.add(wireframeMesh);
const countryBlocks = {},
    countryPrograms = {
        "India": ["UG", "PG", "Mobility", "Research"],
        "Europe": ["UG", "PG", "Mobility", "Language", "Research"],
        "UK": ["UG", "PG", "Mobility"],
        "Singapore": ["UG", "PG", "Mobility", "Upskilling", "Diploma"],
        "Malaysia": ["UG", "PG", "Diploma", "Mobility"],
        "Canada": ["UG", "PG", "Diploma", "Mobility", "Upskilling"],
        "Thailand": ["UG", "PG", "Diploma", "Mobility"],
        "USA": ["UG", "PG", "Mobility"]
    };
const fontLoader = new THREE.FontLoader();
let arcPaths = [];
let countryLabels = [];

function latLonToVector3(lat, lon, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = (radius * Math.sin(phi) * Math.sin(theta));
    const y = (radius * Math.cos(phi));
    return new THREE.Vector3(x, y, z);
}

function createConnectionPath(fromGroup, toGroup, color = 0xffff00) {
    const start = new THREE.Vector3();
    fromGroup.getWorldPosition(start);
    const end = new THREE.Vector3();
    toGroup.getWorldPosition(end);
    const globeRadius = 1.0;
    const arcOffset = 0.05;
    const distance = start.distanceTo(end);
    const arcElevation = distance * 0.4;
    const offsetStart = start.clone().normalize().multiplyScalar(globeRadius + arcOffset);
    const offsetEnd = end.clone().normalize().multiplyScalar(globeRadius + arcOffset);
    const mid = offsetStart.clone().add(offsetEnd).multiplyScalar(0.5).normalize().multiplyScalar(globeRadius + arcOffset + arcElevation);
    const curve = new THREE.QuadraticBezierCurve3(offsetStart, mid, offsetEnd);
    const geometry = new THREE.TubeGeometry(curve, 64, 0.005, 8, false);
    const vertexShader = `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
    const fragmentShader = `varying vec2 vUv; uniform float time; uniform vec3 color; void main() { float stripe1 = step(0.1, fract(vUv.x * 4.0 + time * 0.2)) - step(0.2, fract(vUv.x * 4.0 + time * 0.2)); float stripe2 = step(0.1, fract(vUv.x * 4.0 - time * 0.2)) - step(0.2, fract(vUv.x * 4.0 - time * 0.2)); float combinedStripes = max(stripe1, stripe2); float glow = (1.0 - abs(vUv.y - 0.5) * 2.0); if (combinedStripes > 0.0) { gl_FragColor = vec4(color, combinedStripes * glow); } else { discard; } }`;
    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: {
                value: 0
            },
            color: {
                value: new THREE.Color(color)
            }
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });
    const path = new THREE.Mesh(geometry, material);
    path.renderOrder = 1;
    globeGroup.add(path);
    return path;
}

function drawAllConnections() {
    const countryNames = ["India", "Europe", "UK", "Canada", "USA", "Singapore", "Malaysia"];
    const pairs = countryNames.map(country => ["Thailand", country]);
    arcPaths = pairs.map(([from, to]) => {
        const fromBlock = countryBlocks[from],
            toBlock = countryBlocks[to];
        if (fromBlock && toBlock) return createConnectionPath(fromBlock, toBlock);
    }).filter(Boolean);
}
fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
    const countryConfigs = [{
        name: "India",
        lat: 22,
        lon: 78,
        color: 0xFF9933
    }, {
        name: "Europe",
        lat: 48.8566,
        lon: 2.3522,
        color: 0x0000FF
    }, {
        name: "UK",
        lat: 53,
        lon: -0.1276,
        color: 0x191970
    }, {
        name: "Singapore",
        lat: 1.35,
        lon: 103.8,
        color: 0xff0000
    }, {
        name: "Malaysia",
        lat: 4,
        lon: 102,
        color: 0x0000ff
    }, {
        name: "Thailand",
        lat: 13.7563,
        lon: 100.5018,
        color: 0xffcc00
    }, {
        name: "Canada",
        lat: 56.1304,
        lon: -106.3468,
        color: 0xff0000
    }, {
        name: "USA",
        lat: 39.8283,
        lon: -98.5795,
        color: 0x003366
    }];
    countryConfigs.forEach(config => {
        const size = 0.03;
        const blockGeometry = new THREE.BoxGeometry(size, size, size);
        const blockMaterial = new THREE.MeshStandardMaterial({
            color: config.color,
            emissive: config.color,
            emissiveIntensity: 0.6,
            transparent: true,
            opacity: 0.95
        });
        const blockMesh = new THREE.Mesh(blockGeometry, blockMaterial);
        blockMesh.userData.countryName = config.name;
        const position = latLonToVector3(config.lat, config.lon, 1.1);
        blockMesh.position.copy(position);
        blockMesh.lookAt(0, 0, 0);
        globeGroup.add(blockMesh);
        countryBlocks[config.name] = blockMesh;
        const lG = new THREE.TextGeometry(config.name, {
            font: font,
            size: 0.018,
            height: 0.0001,
            curveSegments: 8
        });
        lG.center();
        const lM = new THREE.MeshBasicMaterial({
            color: 0xffffff
        });
        const lMesh = new THREE.Mesh(lG, lM);
        countryLabels.push({
            label: lMesh,
            block: blockMesh,
            offset: 0.06
        });
        globeGroup.add(lMesh);
    });
    drawAllConnections();
    highlightCountriesByProgram("UG");
});

function highlightCountriesByProgram(level) {
    Object.entries(countryBlocks).forEach(([country, group]) => {
        const isActive = countryPrograms[country]?.includes(level);
        group.material.emissiveIntensity = isActive ? 1.8 : 0.4;
        group.material.opacity = isActive ? 1.0 : 0.7;
        group.scale.setScalar(isActive ? 1.2 : 1.0);
        const labelItem = countryLabels.find(item => item.block === group);
        if (labelItem) {
            labelItem.label.material.color.set(isActive ? 0xffff00 : 0xffffff);
        }
    });
}

function highlightNeuralCubesByProgram(selectedCategory) {
    const category = selectedCategory.toLowerCase();
    cubes.forEach(cube => {
        if (cube.children && cube.children.length > 10) {
            cube.children.forEach(subCube => {
                if (!subCube.userData || !subCube.userData.programName) return;
                const prog = subCube.userData.programName.toLowerCase();
                let shouldHighlight = false;
                if (category === "ug") {
                    shouldHighlight = /ug|undergraduate|degree|bachelor|bsn|bba|business school|academic/i.test(prog);
                } else if (category === "pg") {
                    shouldHighlight = /pg|postgraduate|master|msc|ma|msn|mba|phd|public policy|journalism|prospectus/i.test(prog);
                } else if (category === "diploma") {
                    shouldHighlight = /diploma/i.test(prog);
                } else if (category === "mobility") {
                    shouldHighlight = /exchange|mobility|semester|abroad|short|global/i.test(prog);
                } else if (category === "upskilling") {
                    shouldHighlight = /upskill|certificat|short|cyber|data|stack|design/i.test(prog);
                } else if (category === "research") {
                    shouldHighlight = !!subCube.userData.researchLink;
                } else if (category === "language") {
                    shouldHighlight = /lang/i.test(prog);
                }
                if (shouldHighlight) {
                    subCube.material.emissiveIntensity = 1.5;
                    subCube.material.opacity = 1.0;
                    subCube.scale.setScalar(1.3);
                } else {
                    subCube.material.emissiveIntensity = 0.2;
                    subCube.material.opacity = 0.25;
                    subCube.scale.setScalar(1.0);
                }
            });
        }
    });
}
const infoPanelOverlay = document.getElementById('infoPanelOverlay');
const infoPanelMainCard = document.getElementById('infoPanelMainCard');
const infoPanelSubcards = document.getElementById('infoPanelSubcards');

function showInfoPanel(data) {
    if (!data || data.university === "Unassigned") return;
    const uniData = allUniversityContent.filter(item => item && item.university === data.university);
    if (uniData.length === 0) return;
    const mainErasmusLink = uniData[0].erasmusLink;
    infoPanelMainCard.innerHTML = `<div class="main-card-details"><img src="${uniData[0].logo}" alt="${uniData[0].university}"><h3>${uniData[0].university}</h3></div><div class="main-card-actions">${mainErasmusLink ? `<a href="${mainErasmusLink}" target="_blank" class="partner-cta erasmus">Erasmus Info</a>` : ''}</div>`;
    infoPanelSubcards.innerHTML = '';
    uniData.forEach(item => {
        if (!item) return;
        const infoLinkClass = item.programLink && item.programLink !== '#' ? 'partner-cta' : 'partner-cta disabled';
        const infoLinkHref = item.programLink && item.programLink !== '#' ? `javascript:window.open('${item.programLink}', '_blank')` : 'javascript:void(0);';
        const applyLinkClass = item.applyLink && item.applyLink !== '#' ? 'partner-cta apply' : 'partner-cta apply disabled';
        const applyLinkHref = item.applyLink && item.applyLink !== '#' ? `javascript:window.open('${item.applyLink}', '_blank')` : 'javascript:void(0);';
        const subcardHTML = `<div class="subcard"><div class="subcard-info"><img src="${item.logo}" alt=""><h4>${item.programName.replace(/\n/g, ' ')}</h4></div><div class="subcard-buttons"><a href="${infoLinkHref}" class="${infoLinkClass}">Info</a><a href="${applyLinkHref}" class="${applyLinkClass}">Apply</a></div></div>`;
        infoPanelSubcards.insertAdjacentHTML('beforeend', subcardHTML);
    });
    infoPanelOverlay.style.display = 'flex';
}

function hideInfoPanel() {
    infoPanelOverlay.style.display = 'none';
}
const raycaster = new THREE.Raycaster(),
    mouse = new THREE.Vector2(),
    mouseDownPos = new THREE.Vector2();

function onCanvasMouseDown(event) {
    mouseDownPos.set(event.clientX, event.clientY);
}

function closeAllExploded() {
    if (isEuropeCubeExploded) toggleFunctionMap['Europe']();
    if (isNewThailandCubeExploded) toggleFunctionMap['Thailand']();
    if (isCanadaCubeExploded) toggleFunctionMap['Canada']();
    if (isUkCubeExploded) toggleFunctionMap['UK']();
    if (isUsaCubeExploded) toggleFunctionMap['USA']();
    if (isIndiaCubeExploded) toggleFunctionMap['India']();
    if (isSingaporeCubeExploded) toggleFunctionMap['Singapore']();
    if (isMalaysiaCubeExploded) toggleFunctionMap['Malaysia']();
}

function onCanvasMouseUp(event) {
    if (transformControls.dragging) return;
    const deltaX = Math.abs(event.clientX - mouseDownPos.x),
        deltaY = Math.abs(event.clientY - mouseDownPos.y);
    if (deltaX > 5 || deltaY > 5) return;
    if (event.target.closest('.info-panel')) return;
    const canvasRect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - canvasRect.left) / canvasRect.width) * 2 - 1;
    mouse.y = -((event.clientY - canvasRect.top) / canvasRect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const allClickableObjects = [...Object.values(countryBlocks), ...neuronGroup.children];
    const intersects = raycaster.intersectObjects(allClickableObjects, true);
    if (intersects.length === 0) {
        closeAllExploded();
        return;
    }
    const clickedObject = intersects[0].object;
    if (clickedObject.userData.countryName) {
        const countryName = clickedObject.userData.countryName;
        const correspondingNeuralCube = neuralCubeMap[countryName];
        const toggleFunc = toggleFunctionMap[countryName];
        if (correspondingNeuralCube && toggleFunc) {
            const explosionStateMap = {
                'Europe': isEuropeCubeExploded,
                'Thailand': isNewThailandCubeExploded,
                'Canada': isCanadaCubeExploded,
                'UK': isUkCubeExploded,
                'USA': isUsaCubeExploded,
                'India': isIndiaCubeExploded,
                'Singapore': isSingaporeCubeExploded,
                'Malaysia': isMalaysiaCubeExploded
            };
            const anyExploded = Object.values(explosionStateMap).some(state => state);
            closeAllExploded();
            new TWEEN.Tween(correspondingNeuralCube.scale).to({
                x: 1.5,
                y: 1.5,
                z: 1.5
            }, 200).yoyo(true).repeat(1).start();
            setTimeout(() => {
                toggleFunc();
            }, anyExploded ? 810 : 400);
        }
        return;
    }
    let parent = clickedObject;
    let neuralName = null;
    let clickedSubCube = clickedObject.userData.isSubCube ? clickedObject : null;
    while (parent) {
        if (parent.userData.neuralName) {
            neuralName = parent.userData.neuralName;
            break;
        }
        parent = parent.parent;
    }
    const explosionStateMap = {
        'Europe': isEuropeCubeExploded,
        'Thailand': isNewThailandCubeExploded,
        'Canada': isCanadaCubeExploded,
        'UK': isUkCubeExploded,
        'USA': isUsaCubeExploded,
        'India': isIndiaCubeExploded,
        'Singapore': isSingaporeCubeExploded,
        'Malaysia': isMalaysiaCubeExploded
    };
    if (neuralName) {
        const isExploded = explosionStateMap[neuralName];
        const toggleFunc = toggleFunctionMap[neuralName];
        if (isExploded && clickedSubCube && clickedSubCube.userData.university !== "Unassigned") {
            showInfoPanel(clickedSubCube.userData);
        } else {
            const anyExploded = Object.values(explosionStateMap).some(state => state);
            closeAllExploded();
            setTimeout(() => toggleFunc(), anyExploded ? 810 : 0);
        }
    } else {
        closeAllExploded();
    }
}
renderer.domElement.addEventListener('mousedown', onCanvasMouseDown);
renderer.domElement.addEventListener('mouseup', onCanvasMouseUp);

const panSpeed = 3;
document.getElementById('btn-up').addEventListener('click', () => {
    controls.pan(0, -panSpeed);
    controls.update();
});
document.getElementById('btn-down').addEventListener('click', () => {
    controls.pan(0, panSpeed);
    controls.update();
});
document.getElementById('btn-left').addEventListener('click', () => {
    controls.pan(panSpeed, 0);
    controls.update();
});
document.getElementById('btn-right').addEventListener('click', () => {
    controls.pan(-panSpeed, 0);
    controls.update();
});
document.getElementById('btn-zoom-in').addEventListener('click', () => {
    controls.dollyIn(1.2);
    controls.update();
});
document.getElementById('btn-zoom-out').addEventListener('click', () => {
    controls.dollyOut(1.2);
    controls.update();
});
document.getElementById('btn-rotate').addEventListener('click', () => {
    controls.autoRotate = !controls.autoRotate;
    document.getElementById('btn-rotate').style.background = controls.autoRotate ? '#a46bfd' : 'rgba(0,0,0,0.8)';
});
document.getElementById("pauseButton").addEventListener("click", () => {
    isRotationPaused = !isRotationPaused;
    controls.autoRotate = !isRotationPaused;
    document.getElementById("pauseButton").textContent = isRotationPaused ? "Resume Rotation" : "Pause Rotation";
});
document.getElementById("pauseCubesButton").addEventListener("click", () => {
    isCubeMovementPaused = !isCubeMovementPaused;
    document.getElementById("pauseCubesButton").textContent = isCubeMovementPaused ? "Resume Cube Motion" : "Pause Cube Motion";
});
document.getElementById("toggleMeshButton").addEventListener("click", () => {
    wireframeMesh.visible = !wireframeMesh.visible;
    document.getElementById("toggleMeshButton").textContent = wireframeMesh.visible ? "Hide Globe Mesh" : "Show Globe Mesh";
});
document.getElementById("arcToggleBtn").addEventListener("click", () => {
    let visible = false;
    arcPaths.forEach((p, i) => {
        if (i === 0) {
            visible = !p.visible;
        }
        p.visible = visible;
    });
});
document.getElementById('toggleNodesButton').addEventListener('click', () => {
    const neuralNodes = cubes.filter(cube => cube.userData.isSmallNode);
    const areVisible = neuralNodes.length > 0 && neuralNodes[0].visible;
    const newVisibility = !areVisible;
    neuralNodes.forEach(node => {
        node.visible = newVisibility;
    });
    if (neuralNetworkLines) {
        neuralNetworkLines.visible = newVisibility;
    }
    document.getElementById('toggleNodesButton').textContent = newVisibility ? "Hide Neural Nodes" : "Show Neural Nodes";
});
const scrollLockButton = document.getElementById('scrollLockBtn');
const scrollLockInstruction = document.getElementById('scrollLockInstruction');

function setGlobeInteraction(isInteractive) {
    if (controls) {
        controls.enabled = isInteractive;
    }
    if (isInteractive) {
        scrollLockButton.textContent = 'Unlock Scroll';
        scrollLockButton.classList.remove('unlocked');
        scrollLockInstruction.textContent = 'Globe is active.';
    } else {
        scrollLockButton.textContent = 'Lock Globe';
        scrollLockButton.classList.add('unlocked');
        scrollLockInstruction.textContent = 'Page scroll is active.';
    }
}
scrollLockButton.addEventListener('click', () => {
    setGlobeInteraction(!controls.enabled);
});
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();
    if (controls && controls.enabled) {
        controls.update();
    }
    TWEEN.update();
    arcPaths.forEach(path => {
        if (path.material.isShaderMaterial) {
            path.material.uniforms.time.value = elapsedTime;
        }
    });
    countryLabels.forEach(item => {
        const worldPosition = new THREE.Vector3();
        item.block.getWorldPosition(worldPosition);
        const offsetDirection = worldPosition.clone().normalize();
        const labelPosition = worldPosition.clone().add(offsetDirection.multiplyScalar(item.offset));
        item.label.position.copy(labelPosition);
        item.label.lookAt(camera.position);
    });
    const explosionStateMap = {
        'Europe': isEuropeCubeExploded,
        'Thailand': isNewThailandCubeExploded,
        'Canada': isCanadaCubeExploded,
        'UK': isUkCubeExploded,
        'USA': isUsaCubeExploded,
        'India': isIndiaCubeExploded,
        'Singapore': isSingaporeCubeExploded,
        'Malaysia': isMalaysiaCubeExploded
    };
    const boundaryRadius = 1.0;
    const buffer = 0.02;
    if (!isCubeMovementPaused) {
        cubes.forEach((cube, i) => {
            const isExploded = cube.userData.neuralName && explosionStateMap[cube.userData.neuralName];
            if (!isExploded) {
                cube.position.add(velocities[i]);
                if (cube.position.length() > boundaryRadius - buffer) {
                    cube.position.normalize().multiplyScalar(boundaryRadius - buffer);
                    velocities[i].reflect(cube.position.clone().normalize());
                }
            }
        });
        if (neuralNetworkLines) {
            const vertices = [];
            const maxDist = 0.6;
            const connectionsPerCube = 4;
            for (let i = 0; i < cubes.length; i++) {
                if (!cubes[i].visible || cubes[i].userData.neuralName) continue;
                let neighbors = [];
                for (let j = 0; j < cubes.length; j++) {
                    if (i === j || !cubes[j].visible || cubes[j].userData.neuralName) continue;
                    const dist = cubes[i].position.distanceTo(cubes[j].position);
                    if (dist < maxDist) {
                        neighbors.push({
                            dist: dist,
                            cube: cubes[j]
                        });
                    }
                }
                neighbors.sort((a, b) => a.dist - b.dist);
                const closest = neighbors.slice(0, connectionsPerCube);
                closest.forEach(n => {
                    vertices.push(cubes[i].position.x, cubes[i].position.y, cubes[i].position.z);
                    vertices.push(n.cube.position.x, n.cube.position.y, n.cube.position.z);
                });
            }
            if (neuralNetworkLines.visible) {
                neuralNetworkLines.geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
            }
        }
    }
    renderer.render(scene, camera);
}
updateCanvasSize();
animate();
setGlobeInteraction(true);
window.addEventListener('resize', updateCanvasSize);
