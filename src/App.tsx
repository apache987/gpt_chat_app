import { useState } from 'react'
import Dialog from './components/Dialog'
import './App.css'
import GptChatApp from './components/GptChatApp'
function App() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <>
      {/* ダイアログの使用例 */}
      <div className="p-4">
        <button 
          onClick={() => setIsDialogOpen(true)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          ダイアログを開く
        </button>
        
        <Dialog 
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          title="サンプルダイアログ"
        >
          <GptChatApp isOpen={isDialogOpen} />
        </Dialog>
      </div>
    </>
  )
}

export default App
