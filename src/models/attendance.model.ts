import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
  employeeId: mongoose.Schema.Types.ObjectId;
  date: string; // YYYY-MM-DD
  checkIn: Date | null;
  checkOut: Date | null;
  totalHours: number;
  status: 'present' | 'absent' | 'on_leave';
}

const AttendanceSchema: Schema = new Schema({
  employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  checkIn: { type: Date, default: null },
  checkOut: { type: Date, default: null },
  totalHours: { type: Number, default: 0 },
  status: { type: String, enum: ['present', 'absent', 'on_leave'], default: 'present' }
}, {
  timestamps: true
});

AttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

export default mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);
