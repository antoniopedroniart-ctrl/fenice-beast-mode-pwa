import StudyPlanner from './pages/StudyPlanner';
<NavLink to="/study" className={({isActive})=> isActive? 'btn primary' : 'btn'}>Study Planner</NavLink>
<Route path="/study" element={<StudyPlanner/>} />
