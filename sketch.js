let population;
let lifespan = 400;
let lifeP;
let count = 0;
let target;
let maxforce = 0.2;

function setup() {
    createCanvas(800, 400);
    population = new Population();
    lifeP = createP();
    target = createVector(width / 2, 50);
}

function draw() {
    background(0);
    population.run();
    lifeP.html(count);

    count++;
    if (count == lifespan) {
        population.evaluate();
        population.selection();
        count = 0;
    }

    fill(255);
    ellipse(target.x, target.y, 16, 16);
}

class DNA {
    constructor() {
        this.genes = [];
        for (let i = 0; i < lifespan; i++) {
            this.genes[i] = p5.Vector.random2D();
            this.genes[i].setMag(maxforce);
        }
    }
}

class Rocket {
    constructor(dna) {
        this.pos = createVector(width / 2, height - 10);
        this.vel = createVector();
        this.acc = createVector();
        this.completed = false;
        this.crashed = false;
        this.fitness = 0;
        this.dna = dna || new DNA();

        this.applyForce = function (force) {
            this.acc.add(force);
        }

        this.update = function () {
            let d = dist(this.pos.x, this.pos.y, target.x, target.y);
            if (d < 10) {
                this.completed = true;
                this.pos = target.copy();
            }

            if (this.pos.x > width || this.pos.x < 0 || this.pos.y > height || this.pos.y < 0) {
                this.crashed = true;
            }

            this.applyForce(this.dna.genes[count]);
            if (!this.completed && !this.crashed) {
                this.vel.add(this.acc);
                this.pos.add(this.vel);
                this.acc.mult(0);
            }
        }

        this.show = function () {
            push();
            noStroke();
            fill(255, 150);
            translate(this.pos.x, this.pos.y);
            rotate(this.vel.heading());
            rectMode(CENTER);
            rect(0, 0, 25, 5);
            pop();
        }

        this.calcFitness = function () {
            let d = dist(this.pos.x, this.pos.y, target.x, target.y);
            this.fitness = map(d, 0, width, width, 0);
            if (this.completed) {
                this.fitness *= 10;
            }
            if (this.crashed) {
                this.fitness /= 10;
            }
        }
    }
}

class Population {
    constructor() {
        this.rockets = [];
        this.popsize = 100;
        this.matingpool = [];

        for (let i = 0; i < this.popsize; i++) {
            this.rockets[i] = new Rocket();
        }

        this.evaluate = function () {
            let maxfit = 0;
            for (let rocket of this.rockets) {
                rocket.calcFitness();
                if (rocket.fitness > maxfit) {
                    maxfit = rocket.fitness;
                }
            }

            for (let rocket of this.rockets) {
                rocket.fitness /= maxfit;
            }

            this.matingpool = [];
            for (let rocket of this.rockets) {
                let n = rocket.fitness * 100;
                for (let j = 0; j < n; j++) {
                    this.matingpool.push(rocket);
                }
            }
        }

        this.selection = function () {
            let newRockets = [];
            for (let i = 0; i < this.rockets.length; i++) {
                let parentA = random(this.matingpool).dna;
                let parentB = random(this.matingpool).dna;
                let child = this.crossover(parentA, parentB);
                newRockets[i] = new Rocket(child);
            }
            this.rockets = newRockets;
        }

        this.crossover = function (a, b) {
            let newDNA = new DNA();
            let midpoint = floor(random(a.genes.length));
            for (let i = 0; i < a.genes.length; i++) {
                if (i > midpoint) {
                    newDNA.genes[i] = a.genes[i];
                } else {
                    newDNA.genes[i] = b.genes[i];
                }
            }
            return newDNA;
        }

        this.run = function () {
            for (let rocket of this.rockets) {
                rocket.update();
                rocket.show();
            }
        }
    }
}
