function animatePath(path) {
    // add service time stop points
    const speed = path.dataset.speed;

    if (!speed)
        throw "Speed must be set on elements";

    const animationEnd = 1
    const length = path.getTotalLength();
    const animatedLength = animationEnd*length;

    document.documentElement.style
        .setProperty('--animation-end', (1-animationEnd)*length);

    const duration = animatedLength/speed;

    path.style.setProperty('animation-duration', `${duration}s`)
    path.style.setProperty('stroke-dashoffset', length);
    path.style.setProperty('stroke-dasharray', length);

    let delay = 0;
    if (path.dataset.delaylength && path.dataset.delayspeed) {
        delay = Number(path.dataset.delaylength)/Number(path.dataset.delayspeed);
        path.style.setProperty('animation-delay', `${delay}s`);
    }

    return delay+duration;
}

const radioInputs = document.getElementById("vehicleSelector");
const radios = document.getElementById('form').elements.type;

let sameTypeClickLock = false;
let lockId = null;

function onClick(e) {
    const value = e.target.parentElement.querySelector('input').value;

    if (value == radios.value && !sameTypeClickLock) {
        radioChange()
    }
}

function radioChange() {

    if (lockId) {
        clearTimeout(lockId);
        lockId = null;
    }

    // Hide all the elements
    for (let g of ['van', 'bikes', 'mixed']) {
        const element = document.getElementById(g)
        element.style.setProperty('visibility', 'hidden');

        for (let child of element.querySelectorAll('path')) {
            child.classList.remove('path')
        }

        for (let el of document.querySelectorAll(`div.tradeoffs.${g}`)) {
            el.style.setProperty('display', 'none');
        }
    }

    // display the correct tradeoff text
    for (let el of document.querySelectorAll(`div.tradeoffs.${radios.value}`)) {
        el.style.setProperty('display', 'flex');
    }

    // Wait for the DOM to update in case we're reanimating the same path
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            // Display the correct path
            const element = document.getElementById(radios.value);
            element.style.setProperty('visibility', 'visible');

            // Keep track of animation duration for animation lock
            let maxDuration = 0;

            // start animations
            for (let child of element.querySelectorAll('path')) {
                child.classList.add('path')
                const duration = animatePath(child);

                if (duration > maxDuration)
                    maxDuration = duration;
            }

            // Set and unset lock
            sameTypeClickLock = true;
            lockId = setTimeout(() => {
                sameTypeClickLock = false;
                lockId = null;
            }, maxDuration*1000);
        })
    })
}

radioChange()

radioInputs.addEventListener('change', radioChange);

for (let el of document.querySelectorAll('span.radio')) {
    el.addEventListener('click', onClick)
}
