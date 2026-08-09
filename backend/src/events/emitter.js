import EventEmitter from 'events';

const eventEmitter = new EventEmitter();

// Alert events
eventEmitter.on('newAlert', (alert) => {
  console.log('New alert detected:', alert);
});

eventEmitter.on('alertSent', (result) => {
  console.log('Alert sent:', result);
});

eventEmitter.on('projectDetected', (project) => {
  console.log('New project detected:', project);
});

export default eventEmitter;
