const newtonsLaws = {
    // ── Identity ──────────────────────────────────────────
    slug: "newtons-laws",
    domain: "physics",
    topic: "classical-mechanics",
    titleFormal: "Newton's Laws: Force, Mass & the Three Laws",
    titleDisplay: "The Three Rules That Govern Every Push and Pull",
    tagline: "Why everything that moves — moves the way it does.",

    // ── Story ─────────────────────────────────────────────
    story: `Imagine you're sitting in a perfectly smooth train that's moving at constant speed. You close your eyes. You feel nothing. No push, no pull. From your body's perspective, you might as well be standing still. This isn't a trick — it's Newton's First Law. An object that isn't being pushed or pulled will keep doing exactly what it's already doing, forever. Moving stays moving. Still stays still. We call this inertia.

Now the train brakes. Suddenly you lurch forward. Something pushed the train backward — friction from the brakes — but nothing pushed you. Your body wanted to keep moving forward, and it did, briefly, until the seat belt or your feet caught up. Inertia in action.

Newton's Second Law makes this precise. Force equals mass times acceleration: F = ma. The harder you push something, the faster it accelerates. The heavier something is, the harder you have to push to get the same acceleration. A shopping trolley and a car might both need a push, but the car needs a much bigger one to reach the same speed in the same time.

The Third Law is the one that surprises people. Every force has an equal and opposite reaction. When you push against a wall, the wall pushes back on you with exactly the same force. When a rocket fires its engines downward, the gas pushes the rocket upward with equal force. When you walk, your foot pushes backward on the ground and the ground pushes you forward. You are only able to move because the Earth pushes back.

These three laws together explain everything from falling apples to orbiting satellites. They were the foundation of all physics for over 200 years — and for most of the physical world you experience every day, they still are. Generally speaking, a force acting on an object, brings about its motion; not always though. Only when the object moves, the force can do work. The more the motion, the more the work done by the force.`,

    // ── Blitz Statements ─────────────────────────────────
    blitz: [
        {
            id: 1,
            statement: "An object moving at constant velocity has no net force acting on it.",
            answer: true,
            conceptTags: ["Newton-1"],
            difficultyEstimate: 1,
            misconceptionTag: null
        },
        {
            id: 2,
            statement: "A heavier object always falls faster than a lighter one.",
            answer: false,
            conceptTags: ["free-fall"],
            difficultyEstimate: 1,
            misconceptionTag: "heavier-objects-fall-faster"
        },
        {
            id: 3,
            statement: "Newton's Third Law means forces always cancel out and nothing can move.",
            answer: false,
            conceptTags: ["Newton-3"],
            difficultyEstimate: 2,
            misconceptionTag: "action-reaction-cancels"
        },
        {
            id: 4,
            statement: "If you double the force on an object, you double its acceleration.",
            answer: true,
            conceptTags: ["Newton-2"],
            difficultyEstimate: 1,
            misconceptionTag: null
        },
        {
            id: 5,
            statement: "The Earth pulls you down with gravity, and you pull the Earth up with an equal force.",
            answer: true,
            conceptTags: ["Newton-3"],
            difficultyEstimate: 2,
            misconceptionTag: null
        },
        {
            id: 6,
            statement: "An object at rest will start moving on its own if left long enough.",
            answer: false,
            conceptTags: ["inertia"],
            difficultyEstimate: 1,
            misconceptionTag: null
        },
        {
            id: 7,
            statement: "Mass and weight are the same thing.",
            answer: false,
            conceptTags: ["mass-weight"],
            difficultyEstimate: 1,
            misconceptionTag: "mass-equals-weight"
        },
        {
            id: 8,
            statement: "A rocket in space can accelerate even with no air to push against.",
            answer: true,
            conceptTags: ["Newton-3"],
            difficultyEstimate: 2,
            misconceptionTag: null
        },
        {
            id: 9,
            statement: "Friction is always a useless force that only slows things down.",
            answer: false,
            conceptTags: ["friction"],
            difficultyEstimate: 1,
            misconceptionTag: null
        },
        {
            id: 10,
            statement: "If two objects exert equal and opposite forces on each other, they must have the same mass.",
            answer: false,
            conceptTags: ["Newton-3"],
            difficultyEstimate: 2,
            misconceptionTag: null
        },
    ],

    // ── Questions ─────────────────────────────────────────
    questions: [

        // ── Level 1 ──────────────────────────────────────────
        {
            id: 1,
            level: 1,
            type: "standard",
            difficultyEstimate: 1,
            cognitiveProcess: "understand",
            conceptTags: ["inertia"],
            misconceptionTag: null,
            prerequisiteConcept: null,
            anchorDirection: null,
            image: "img01",
            question: "A hockey puck slides on a perfectly frictionless ice surface. No forces act on it. What does it do?",
            options: [
                "Gradually slows down and stops",
                "Continues moving at the same speed in the same direction",
                "Speeds up slowly over time",
                "Moves in a curve"
            ],
            answer: 1,
            explanation: "Newton's First Law: without a net force, a moving object stays moving at constant velocity. There is no friction here to slow it down, so it continues forever. Many people think moving objects naturally slow down — but that's only because friction is almost always present in everyday life."
        },

        {
            id: 2,
            level: 1,
            type: "misconception_probe",
            difficultyEstimate: 2,
            cognitiveProcess: "understand",
            conceptTags: ["free-fall"],
            misconceptionTag: "heavier-objects-fall-faster",
            prerequisiteConcept: null,
            anchorDirection: null,
            image: null,
            question: "A bowling ball and a tennis ball are dropped from the same height in a vacuum. Which hits the ground first?",
            options: [
                "The bowling ball, because it is heavier",
                "The tennis ball, because it is lighter and less affected by gravity",
                "They hit at exactly the same time",
                "It depends on the height they are dropped from"
            ],
            answer: 2,
            explanation: "In a vacuum, all objects fall with the same acceleration regardless of mass. Gravity pulls harder on heavier objects, but heavier objects also have more inertia resisting that pull — these effects cancel exactly. Galileo demonstrated this. The intuition that heavier means faster comes from everyday experience where air resistance matters, but in a vacuum it is completely wrong."
        },

        {
            id: 3,
            level: 1,
            type: "standard",
            difficultyEstimate: 1,
            cognitiveProcess: "apply",
            conceptTags: ["Newton-2"],
            misconceptionTag: null,
            prerequisiteConcept: null,
            anchorDirection: null,
            image: null,
            question: "A 10 kg object accelerates at $3 \\ \\text{m/s}^2$. What is the net force acting on it?",
            options: [
                "0.3 N",
                "13 N",
                "30 N",
                "300 N"
            ],
            answer: 2,
            explanation: "$F = ma = 10 \\times 3 = 30 \\ \\text{N}$. Newton's Second Law directly. Force in newtons, mass in kilograms, acceleration in metres per second squared."
        },

        {
            id: 4,
            level: 1,
            type: "crt",
            difficultyEstimate: 3,
            cognitiveProcess: "analyze",
            conceptTags: ["Newton-3"],
            misconceptionTag: "action-reaction-cancels",
            prerequisiteConcept: null,
            anchorDirection: null,
            image: "img04",
            question: "A horse pulls a cart forward. The cart pulls the horse backward with an equal force. Why does the system move forward at all?",
            options: [
                "The horse's force is slightly bigger than the cart's force",
                "The action-reaction forces act on different objects, so they do not cancel",
                "The cart's wheels reduce the backward force on the horse",
                "Newton's Third Law only applies to stationary objects"
            ],
            answer: 1,
            explanation: "This is the classic Third Law trap. The horse pulls the cart forward and the cart pulls the horse backward — equal and opposite. But these forces act on different objects. What matters for each object's motion is the net force on that object alone. The horse pushes backward on the ground; the ground pushes the horse forward. That forward ground reaction exceeds the cart's backward pull, so the horse accelerates forward and drags the cart with it."
        },

        {
            id: 5,
            level: 1,
            type: "standard",
            difficultyEstimate: 1,
            cognitiveProcess: "understand",
            conceptTags: ["inertia"],
            misconceptionTag: null,
            prerequisiteConcept: null,
            anchorDirection: null,
            image: "img05",
            question: "Which of these is the best example of Newton's First Law?",
            options: [
                "A ball speeding up as it rolls downhill",
                "A passenger lurching forward when a car brakes suddenly",
                "A rocket accelerating upward as it burns fuel",
                "A pendulum swinging back and forth"
            ],
            answer: 1,
            explanation: "When the car brakes, the passenger's body continues moving forward because no force has yet acted on it — pure inertia. The car decelerates around them. The seatbelt then applies the force that decelerates the passenger too."
        },

        {
            id: 6,
            level: 1,
            type: "standard",
            difficultyEstimate: 1,
            cognitiveProcess: "remember",
            conceptTags: ["mass-weight"],
            misconceptionTag: null,
            prerequisiteConcept: null,
            anchorDirection: null,
            image: "img06",
            question: "What is the difference between mass and weight?",
            options: [
                "Mass is measured in newtons, weight is measured in kilograms",
                "They are the same thing measured in different units",
                "Mass is the amount of matter in an object; weight is the gravitational force on that matter",
                "Mass changes with location; weight does not"
            ],
            answer: 2,
            explanation: "Mass is a measure of how much matter an object contains — it is constant everywhere. Weight is the force of gravity acting on that mass: $W = mg$. On the Moon, your mass is unchanged but your weight is about one sixth of what it is on Earth because $g$ is smaller there."
        },

        {
            id: 7,
            level: 1,
            type: "anchor",
            difficultyEstimate: 2,
            cognitiveProcess: "apply",
            conceptTags: ["Newton-2"],
            misconceptionTag: null,
            prerequisiteConcept: null,
            anchorDirection: "high",
            anchorSusceptibleOptionIndex: 2,
            image: null,
            question: "The Eiffel Tower is 330 metres tall. A 5 kg object sits on a frictionless table. A net force of 20 N acts on it. What is its acceleration?",
            options: [
                "$0.25 \\ \\text{m/s}^2$",
                "$4 \\ \\text{m/s}^2$",
                "$25 \\ \\text{m/s}^2$",
                "$100 \\ \\text{m/s}^2$"
            ],
            answer: 1,
            explanation: "$a = F/m = 20/5 = 4 \\ \\text{m/s}^2$. The height of the Eiffel Tower is irrelevant — it is an anchor number designed to see if irrelevant information affects your calculation. If you found yourself thinking about 330 at any point, that is anchoring at work."
        },

        {
            id: 8,
            level: 1,
            type: "misconception_probe",
            difficultyEstimate: 2,
            cognitiveProcess: "understand",
            conceptTags: ["Newton-1", "net-force"],
            misconceptionTag: "constant-speed-requires-force",
            prerequisiteConcept: null,
            anchorDirection: null,
            image: null,
            question: "A car travels at a constant 60 km/h on a straight flat road. What is the net force on the car?",
            options: [
                "A large forward force from the engine",
                "A small forward force to maintain speed",
                "Zero — the forces are balanced",
                "A backward force because friction is always dominant"
            ],
            answer: 2,
            explanation: "Constant velocity means zero acceleration, which means zero net force by Newton's Second Law ($F = ma$, so if $a = 0$ then $F = 0$). The engine produces a forward force, but friction and air resistance produce an exactly equal backward force. They cancel. This misconception — that maintaining speed requires a net force — is one of the most common in all of physics and was Aristotle's view for 2000 years before Newton."
        },

        {
            id: 9,
            level: 1,
            type: "standard",
            difficultyEstimate: 2,
            cognitiveProcess: "apply",
            conceptTags: ["Newton-2", "net-force"],
            misconceptionTag: null,
            prerequisiteConcept: null,
            anchorDirection: null,
            image: "img09",
            question: "You push a 2 kg book across a table with 10 N of force. Friction exerts 4 N in the opposite direction. What is the book's acceleration?",
            options: [
                "$5 \\ \\text{m/s}^2$",
                "$3 \\ \\text{m/s}^2$",
                "$7 \\ \\text{m/s}^2$",
                "$2 \\ \\text{m/s}^2$"
            ],
            answer: 1,
            explanation: "Net force $= 10 - 4 = 6 \\ \\text{N}$. Then $a = F/m = 6/2 = 3 \\ \\text{m/s}^2$. Always use net force in $F = ma$, not just the applied force."
        },

        {
            id: 10,
            level: 1,
            type: "crt",
            difficultyEstimate: 3,
            cognitiveProcess: "apply",
            conceptTags: ["Newton-3"],
            misconceptionTag: "thrower-does-not-recoil",
            prerequisiteConcept: null,
            anchorDirection: null,
            image: null,
            question: "You are floating in deep space, far from any object. You throw a ball away from you. What happens to you?",
            options: [
                "Nothing — only the ball moves",
                "You move slowly in the opposite direction to the ball",
                "You and the ball move in the same direction",
                "You spin in place"
            ],
            answer: 1,
            explanation: "Newton's Third Law. When you push the ball away, the ball pushes you back with an equal and opposite force. Since there is no friction or air resistance, you accelerate in the opposite direction. This is the same principle as a rocket — you are briefly a rocket. The System 1 answer is 'nothing happens to me' because in everyday life the ground absorbs your reaction force invisibly."
        },

        // ── Level 2 ──────────────────────────────────────────
        {
            id: 11,
            level: 2,
            type: "standard",
            difficultyEstimate: 2,
            cognitiveProcess: "apply",
            conceptTags: ["Newton-2", "net-force"],
            misconceptionTag: null,
            prerequisiteConcept: null,
            anchorDirection: null,
            image: null,
            question: "Two forces act on an object: 15 N to the right and 9 N to the left. The object has a mass of 3 kg. What is its acceleration and direction?",
            options: [
                "$2 \\ \\text{m/s}^2$ to the right",
                "$8 \\ \\text{m/s}^2$ to the right",
                "$3 \\ \\text{m/s}^2$ to the left",
                "$6 \\ \\text{m/s}^2$ to the right"
            ],
            answer: 0,
            explanation: "Net force $= 15 - 9 = 6 \\ \\text{N}$ to the right. $a = 6/3 = 2 \\ \\text{m/s}^2$ to the right. Direction matters — always subtract opposing forces first."
        },

        {
            id: 12,
            level: 2,
            type: "misconception_probe",
            difficultyEstimate: 2,
            cognitiveProcess: "understand",
            conceptTags: ["Newton-1"],
            misconceptionTag: "constant-speed-requires-force",
            prerequisiteConcept: null,
            anchorDirection: null,
            image: null,
            question: "A spacecraft in deep space turns off its engines. It was moving at 2000 m/s. One hour later, what is its speed assuming no gravitational fields nearby?",
            options: [
                "Less than 2000 m/s because nothing is pushing it",
                "Exactly 2000 m/s",
                "More than 2000 m/s because it built up momentum",
                "Zero — it gradually coasts to a stop"
            ],
            answer: 1,
            explanation: "With no net force, velocity is constant. No force means no acceleration means no change in speed ($F = 0 \\Rightarrow a = 0 \\Rightarrow \\Delta v = 0$). The spacecraft continues at exactly 2000 m/s indefinitely. This is Newton's First Law in its purest form — no air resistance, no friction, no gravity. The intuition that it slows down is entirely the product of living in a world full of friction."
        },

        {
            id: 13,
            level: 2,
            type: "standard",
            difficultyEstimate: 3,
            cognitiveProcess: "apply",
            conceptTags: ["Newton-2"],
            misconceptionTag: null,
            prerequisiteConcept: null,
            anchorDirection: null,
            image: null,
            question: "A 1000 kg car brakes from 20 m/s to rest over 4 seconds. What braking force was applied?",
            options: [
                "200 N",
                "5000 N",
                "80000 N",
                "4000 N"
            ],
            answer: 1,
            explanation: "First find acceleration: $a = (0 - 20)/4 = -5 \\ \\text{m/s}^2$. Then $F = ma = 1000 \\times 5 = 5000 \\ \\text{N}$. The negative sign indicates deceleration — the force is opposite to motion. Braking forces are large because cars are heavy."
        },

        {
            id: 14,
            level: 2,
            type: "crt",
            difficultyEstimate: 3,
            cognitiveProcess: "analyze",
            conceptTags: ["Newton-3"],
            misconceptionTag: "action-reaction-cancels",
            prerequisiteConcept: null,
            anchorDirection: null,
            image: null,
            question: "A small car and a large truck collide. During the collision, which statement is true?",
            options: [
                "The truck exerts a larger force on the car than the car exerts on the truck",
                "The car exerts a larger force on the truck than the truck exerts on the car",
                "They exert equal forces on each other",
                "The forces depend on which vehicle was moving faster"
            ],
            answer: 2,
            explanation: "Newton's Third Law is absolute — the forces are always equal and opposite regardless of size, mass, or speed. The car and truck exert identical forces on each other. The reason the car is more damaged is not because of larger force but because of smaller mass — same force, smaller mass means greater acceleration, greater deformation. $F = ma$: same $F$, smaller $m$, larger $a$."
        },

        {
            id: 15,
            level: 2,
            type: "standard",
            difficultyEstimate: 3,
            cognitiveProcess: "apply",
            conceptTags: ["Newton-2", "net-force"],
            misconceptionTag: null,
            prerequisiteConcept: null,
            anchorDirection: null,
            image: null,
            question: "An elevator accelerates upward at $2 \\ \\text{m/s}^2$. A person inside has a mass of 70 kg. What does the scale under them read? $(g = 10 \\ \\text{m/s}^2)$",
            options: [
                "700 N",
                "840 N",
                "560 N",
                "140 N"
            ],
            answer: 1,
            explanation: "The scale reads the normal force $N$, not just weight. Net force upward $= ma = 70 \\times 2 = 140 \\ \\text{N}$. This net force equals $N - mg$, so $N = mg + ma = 70(10 + 2) = 840 \\ \\text{N}$. Accelerating upward makes you feel heavier. Accelerating downward makes you feel lighter — in freefall the scale reads zero."
        },

        {
            id: 16,
            level: 2,
            type: "misconception_probe",
            difficultyEstimate: 2,
            cognitiveProcess: "understand",
            conceptTags: ["free-fall"],
            misconceptionTag: "heavier-objects-fall-faster",
            prerequisiteConcept: null,
            anchorDirection: null,
            image: null,
            question: "On the Moon (no atmosphere), a feather and a hammer are dropped simultaneously. What happens?",
            options: [
                "The hammer lands first because it is heavier",
                "The feather lands first because it has less mass to accelerate",
                "They land simultaneously",
                "Neither falls because the Moon has low gravity"
            ],
            answer: 2,
            explanation: "This was famously demonstrated by Apollo 15 astronaut David Scott on the lunar surface in 1971. With no atmosphere, there is no air resistance. Both objects experience the same gravitational acceleration ($g_{\\text{Moon}} \\approx 1.62 \\ \\text{m/s}^2$) regardless of mass, and land together. The video is one of the most elegant demonstrations of Newton's laws ever filmed."
        },

        {
            id: 17,
            level: 2,
            type: "anchor",
            difficultyEstimate: 2,
            cognitiveProcess: "apply",
            conceptTags: ["Newton-2"],
            misconceptionTag: null,
            prerequisiteConcept: null,
            anchorDirection: "high",
            anchorSusceptibleOptionIndex: 2,
            image: null,
            question: "Isaac Newton was born in 1643. A box is pushed with 50 N of force. Friction is 20 N. The box accelerates at $5 \\ \\text{m/s}^2$. What is the mass of the box?",
            options: [
                "6 kg",
                "10 kg",
                "14 kg",
                "3 kg"
            ],
            answer: 0,
            explanation: "Net force $= 50 - 20 = 30 \\ \\text{N}$. $m = F/a = 30/5 = 6 \\ \\text{kg}$. Newton's birth year is an anchor. If it influenced your estimate at all — perhaps pulling you toward numbers near 1643 or 43 — that is anchoring bias operating on a numerical calculation, which is its most dangerous form."
        },

        {
            id: 18,
            level: 2,
            type: "standard",
            difficultyEstimate: 2,
            cognitiveProcess: "understand",
            conceptTags: ["Newton-3"],
            misconceptionTag: null,
            prerequisiteConcept: null,
            anchorDirection: null,
            image: null,
            question: "Which situation correctly applies Newton's Third Law?",
            options: [
                "A book on a table: gravity pulls the book down, the normal force pushes it up",
                "A swimmer pushing backward on water, the water pushing the swimmer forward",
                "A ball decelerating due to air resistance",
                "A planet pulling a moon into orbit"
            ],
            answer: 1,
            explanation: "The swimmer and water are a true Third Law pair — the swimmer exerts a force on the water, the water exerts an equal and opposite force on the swimmer. Option A is not a Third Law pair — gravity and normal force act on the same object (the book) and arise from different sources. Third Law pairs always act on different objects and are the same type of force."
        },

        {
            id: 19,
            level: 2,
            type: "crt",
            difficultyEstimate: 3,
            cognitiveProcess: "understand",
            conceptTags: ["Newton-1", "net-force"],
            misconceptionTag: "constant-speed-requires-force",
            prerequisiteConcept: null,
            anchorDirection: null,
            image: null,
            question: "A skydiver reaches terminal velocity. What is the net force on them at that moment?",
            options: [
                "A large downward force from gravity",
                "A small downward force since they are still moving down",
                "Zero",
                "A small upward force since air resistance is winning"
            ],
            answer: 2,
            explanation: "Terminal velocity means constant velocity, which means zero acceleration ($a = 0$), which means zero net force ($F = ma = 0$). Gravity pulls down with exactly the same force as air resistance pushes up. They are balanced. The System 1 answer is 'downward force' because the person is clearly falling — but falling at constant speed is identical to hovering, from a force perspective."
        },

        {
            id: 20,
            level: 2,
            type: "standard",
            difficultyEstimate: 3,
            cognitiveProcess: "apply",
            conceptTags: ["net-force"],
            misconceptionTag: null,
            prerequisiteConcept: "vector-addition",
            anchorDirection: null,
            image: null,
            question: "A 5 kg object is on a frictionless surface. Forces of 12 N east and 5 N north act on it simultaneously. What is the magnitude of the net force?",
            options: [
                "17 N",
                "7 N",
                "13 N",
                "60 N"
            ],
            answer: 2,
            explanation: "When forces act at right angles, use Pythagoras: $\\sqrt{12^2 + 5^2} = \\sqrt{144 + 25} = \\sqrt{169} = 13 \\ \\text{N}$. Forces are vectors — you cannot simply add their magnitudes unless they point in the same direction. The direction of the net force is $\\arctan(5/12) \\approx 22.6°$ north of east."
        },

        // ── Level 3 ──────────────────────────────────────────
        {
            id: 21,
            level: 3,
            type: "standard",
            difficultyEstimate: 4,
            cognitiveProcess: "apply",
            conceptTags: ["Newton-2", "tension"],
            misconceptionTag: null,
            prerequisiteConcept: null,
            anchorDirection: null,
            image: null,
            question: "Two blocks are connected by a string and pulled across a frictionless surface by a 30 N force. Block A (3 kg) is in front, Block B (2 kg) is behind. What is the tension in the string between them?",
            options: [
                "30 N",
                "12 N",
                "18 N",
                "15 N"
            ],
            answer: 1,
            explanation: "Total mass $= 5 \\ \\text{kg}$. System acceleration $= 30/5 = 6 \\ \\text{m/s}^2$. The string only needs to accelerate Block B: $T = m_B \\times a = 2 \\times 6 = 12 \\ \\text{N}$. The string does not need to pull the full 30 N — that force is applied to Block A directly. This is a constraint problem: analyse the system first, then isolate one object."
        },

        {
            id: 22,
            level: 3,
            type: "crt",
            difficultyEstimate: 5,
            cognitiveProcess: "analyze",
            conceptTags: ["inertia", "Newton-1"],
            misconceptionTag: "no-gravity-in-space",
            prerequisiteConcept: null,
            anchorDirection: null,
            image: null,
            question: "You are in a sealed box with no windows, accelerating in space at $9.8 \\ \\text{m/s}^2$. You drop a ball. What happens?",
            options: [
                "The ball floats — there is no gravity in space",
                "The ball falls to the floor at the same rate as on Earth's surface",
                "The ball drifts slowly toward the floor",
                "The ball moves toward the ceiling because the box accelerates away from it"
            ],
            answer: 1,
            explanation: "This is Einstein's equivalence principle — the foundation of General Relativity. Acceleration at $9.8 \\ \\text{m/s}^2$ is physically indistinguishable from standing in Earth's gravitational field. The ball falls to the floor in exactly the same way. You cannot tell from inside the box whether you are in gravity or accelerating. Newton's laws are silent on this distinction — Einstein's insight was that this indistinguishability is not a coincidence but a deep truth about the nature of gravity."
        },

        {
            id: 23,
            level: 3,
            type: "misconception_probe",
            difficultyEstimate: 4,
            cognitiveProcess: "understand",
            conceptTags: ["free-fall", "Newton-2"],
            misconceptionTag: "velocity-zero-means-acceleration-zero",
            prerequisiteConcept: null,
            anchorDirection: null,
            image: null,
            question: "A ball is thrown upward. At the exact top of its trajectory, which statement is true?",
            options: [
                "Velocity is zero and acceleration is zero",
                "Velocity is zero and acceleration is $9.8 \\ \\text{m/s}^2$ downward",
                "Velocity is zero and acceleration is briefly zero before resuming",
                "Both velocity and acceleration are at their minimum values"
            ],
            answer: 1,
            explanation: "At the top, $v = 0$ — the ball has momentarily stopped moving upward before beginning to fall. But acceleration is never zero during the flight: gravity acts continuously at $g = 9.8 \\ \\text{m/s}^2$ downward throughout. Acceleration is the rate of change of velocity, not velocity itself. The ball's velocity is changing at the top (from upward to downward) even though its instantaneous value is zero. Confusing velocity with acceleration is one of the deepest misconceptions in mechanics."
        },

        {
            id: 24,
            level: 3,
            type: "standard",
            difficultyEstimate: 4,
            cognitiveProcess: "apply",
            conceptTags: ["Newton-2", "friction"],
            misconceptionTag: null,
            prerequisiteConcept: null,
            anchorDirection: null,
            image: null,
            question: "A 10 kg block sits on a 40 kg cart on a frictionless floor. Friction between block and cart is 15 N maximum. A 60 N horizontal force is applied to the cart. What is the acceleration of the block?",
            options: [
                "$6 \\ \\text{m/s}^2$",
                "$1.2 \\ \\text{m/s}^2$",
                "$4 \\ \\text{m/s}^2$",
                "$0 \\ \\text{m/s}^2$"
            ],
            answer: 1,
            explanation: "Check if block and cart move together: $a = 60/50 = 1.2 \\ \\text{m/s}^2$. Friction needed to accelerate the block $= 10 \\times 1.2 = 12 \\ \\text{N}$, which is less than the maximum of 15 N, so they move together. The block's acceleration is $1.2 \\ \\text{m/s}^2$. Always check whether surfaces slip before assuming they move as one system."
        },

        {
            id: 25,
            level: 3,
            type: "crt",
            difficultyEstimate: 4,
            cognitiveProcess: "analyze",
            conceptTags: ["Newton-2", "net-force"],
            misconceptionTag: "upward-motion-implies-upward-acceleration",
            prerequisiteConcept: null,
            anchorDirection: null,
            image: null,
            question: "A person stands on a scale in a lift. The scale reads less than their true weight. Which of these could be happening?",
            options: [
                "The lift is moving upward at constant speed",
                "The lift is accelerating upward",
                "The lift is accelerating downward",
                "The lift is stationary"
            ],
            answer: 2,
            explanation: "Scale reads less than true weight when the normal force $N < mg$. This occurs when the net force is downward: $N = m(g - a) < mg$. This means the lift is accelerating downward (or decelerating while moving upward). At constant speed in either direction, $a = 0$ so the scale reads exactly $mg$. In freefall ($a = g$), $N = 0$ — weightlessness. The System 1 trap is to think 'moving upward = feels heavier' without distinguishing constant speed from acceleration."
        },

        {
            id: 26,
            level: 3,
            type: "standard",
            difficultyEstimate: 4,
            cognitiveProcess: "apply",
            conceptTags: ["Newton-2", "centripetal-acceleration"],
            misconceptionTag: null,
            prerequisiteConcept: null,
            anchorDirection: null,
            image: null,
            question: "A 3 kg object moves in a circle of radius 2 m at 4 m/s. What net force is required and in what direction?",
            options: [
                "24 N outward",
                "24 N inward",
                "6 N inward",
                "48 N inward"
            ],
            answer: 1,
            explanation: "Centripetal acceleration $= v^2/r = 16/2 = 8 \\ \\text{m/s}^2$ directed inward. $F = ma = 3 \\times 8 = 24 \\ \\text{N}$ inward. The net force must always point toward the centre of the circle — this is what changes the direction of velocity without changing its magnitude. 'Centrifugal force' pushing outward does not exist as a real force — it is a fictitious force felt in the rotating reference frame."
        },

        {
            id: 27,
            level: 3,
            type: "misconception_probe",
            difficultyEstimate: 4,
            cognitiveProcess: "apply",
            conceptTags: ["Newton-3", "momentum"],
            misconceptionTag: "rocket-needs-air-to-push-against",
            prerequisiteConcept: null,
            anchorDirection: null,
            image: null,
            question: "A rocket in space ejects gas at 1000 m/s. The rocket has mass 500 kg and ejects 2 kg of gas per second. What is the rocket's initial acceleration?",
            options: [
                "$2 \\ \\text{m/s}^2$",
                "$0.004 \\ \\text{m/s}^2$",
                "$4 \\ \\text{m/s}^2$",
                "$1000 \\ \\text{m/s}^2$"
            ],
            answer: 2,
            explanation: "Thrust $=$ rate of momentum change $=$ mass flow rate $\\times$ exhaust velocity $= 2 \\times 1000 = 2000 \\ \\text{N}$. Then $a = F/m = 2000/500 = 4 \\ \\text{m/s}^2$. This is Newton's Third Law as propulsion: the rocket pushes gas backward, gas pushes rocket forward with equal force. No air is needed — a common misconception is that rockets need something to push against."
        },

        {
            // NOTE: This was an anchor question in the original. Anchor questions are
            // not permitted in Level 3 (locked rule). Converted to standard.
            // The "37 trillion cells" intro has been removed from the question text.
            // Explanation anchor reference removed accordingly.
            id: 28,
            level: 3,
            type: "standard",
            difficultyEstimate: 4,
            cognitiveProcess: "apply",
            conceptTags: ["Newton-2", "net-force"],
            misconceptionTag: null,
            prerequisiteConcept: null,
            anchorDirection: null,
            image: null,
            question: "Block A (4 kg) and Block B (6 kg) hang from either end of a string over a frictionless pulley. What is the acceleration of the system?",
            options: [
                "$2 \\ \\text{m/s}^2$",
                "$9.8 \\ \\text{m/s}^2$",
                "$1.96 \\ \\text{m/s}^2$",
                "$4.9 \\ \\text{m/s}^2$"
            ],
            answer: 2,
            explanation: "This is an Atwood machine. Net force $= (6 - 4) \\times g = 2 \\times 9.8 = 19.6 \\ \\text{N}$. Total mass $= 10 \\ \\text{kg}$. $a = 19.6/10 = 1.96 \\ \\text{m/s}^2$. The key insight is that gravity acts on both masses — you must find the net unbalanced gravitational force, not apply $g$ directly. The heavier block descends, the lighter ascends, both at the same acceleration."
        },

        {
            id: 29,
            level: 3,
            type: "crt",
            difficultyEstimate: 4,
            cognitiveProcess: "analyze",
            conceptTags: ["work"],
            misconceptionTag: "effort-equals-physical-work",
            prerequisiteConcept: null,
            anchorDirection: null,
            image: null,
            question: "You push a wall with 50 N. The wall does not move. What is the work done by your force on the wall?",
            options: [
                "50 J",
                "More than 50 J, because you are exerting effort",
                "0 J",
                "Negative, because the wall pushes back"
            ],
            answer: 2,
            explanation: "Work $= F \\times d$, where $d$ is displacement in the direction of force. The wall does not move — $d = 0$. Therefore $W = 50 \\times 0 = 0 \\ \\text{J}$ regardless of how hard you push or how tired your muscles become. Your muscles are doing internal biological work (consuming ATP) but no mechanical work on the wall. This distinction between biological effort and physical work is one of the most misunderstood concepts at the boundary of Newtonian mechanics and energy."
        },

        {
            id: 30,
            level: 3,
            type: "standard",
            difficultyEstimate: 3,
            cognitiveProcess: "analyze",
            conceptTags: ["Newton-2"],
            misconceptionTag: null,
            prerequisiteConcept: null,
            anchorDirection: null,
            image: null,
            question: "Which of these scenarios violates Newton's Laws?",
            options: [
                "An object moves in a straight line at constant speed with no forces acting on it",
                "An object accelerates in the opposite direction to the net force on it",
                "Two objects exert equal and opposite forces on each other during a collision",
                "An object at rest remains at rest when the net force on it is zero"
            ],
            answer: 1,
            explanation: "Newton's Second Law: $\\vec{a}$ is always in the same direction as $\\vec{F}_{\\text{net}}$. An object cannot accelerate opposite to the net force — this would directly violate $F = ma$. All other options are correct statements of Newton's laws. If you ever encounter a scenario where an object appears to accelerate against the net force, you have either misidentified the net force direction or are working in a non-inertial reference frame."
        }
    ]
}

export default newtonsLaws