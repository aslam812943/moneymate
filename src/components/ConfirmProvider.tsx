import * as Dialog from '@radix-ui/react-dialog';
import { AlertTriangle, X } from 'lucide-react';
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { Button } from './ui';

type ConfirmOptions={
 title:string;
 description:string;
 confirmLabel?:string;
 cancelLabel?:string;
 danger?:boolean;
};

type PendingConfirmation={options:ConfirmOptions;resolve:(accepted:boolean)=>void};
const ConfirmContext=createContext<((options:ConfirmOptions)=>Promise<boolean>)|null>(null);

export function ConfirmProvider({children}:{children:ReactNode}){
 const [pending,setPending]=useState<PendingConfirmation|null>(null);
 const confirm=useCallback((options:ConfirmOptions)=>new Promise<boolean>(resolve=>setPending({options,resolve})),[]);
 const finish=(accepted:boolean)=>{pending?.resolve(accepted);setPending(null);};
 return <ConfirmContext.Provider value={confirm}>
  {children}
  <Dialog.Root open={!!pending} onOpenChange={open=>!open&&finish(false)}>
   <Dialog.Portal>
    <Dialog.Overlay className="modal-overlay confirm-overlay"/>
    <Dialog.Content className="modal confirm-dialog">
     <div className={pending?.options.danger?'confirm-icon danger':'confirm-icon'}><AlertTriangle size={22}/></div>
     <Dialog.Title>{pending?.options.title}</Dialog.Title>
     <Dialog.Description>{pending?.options.description}</Dialog.Description>
     <Dialog.Close className="modal-close" aria-label="Close confirmation"><X size={20}/></Dialog.Close>
     <div className="confirm-actions">
      <Button variant="outline" onClick={()=>finish(false)}>{pending?.options.cancelLabel||'Cancel'}</Button>
      <Button variant={pending?.options.danger?'danger':'default'} onClick={()=>finish(true)}>{pending?.options.confirmLabel||'Confirm'}</Button>
     </div>
    </Dialog.Content>
   </Dialog.Portal>
  </Dialog.Root>
 </ConfirmContext.Provider>;
}

export function useConfirm(){
 const confirm=useContext(ConfirmContext);
 if(!confirm)throw new Error('useConfirm must be used inside ConfirmProvider');
 return confirm;
}
