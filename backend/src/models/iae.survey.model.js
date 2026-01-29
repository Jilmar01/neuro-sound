import mongoose from 'mongoose';

const iaeSurveySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',                
    required: true
  },
  M1: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  },
  M2: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  },
  M3: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('IAESurvey', iaeSurveySchema);