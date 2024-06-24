'use client'

// React Imports
import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'

// Component Imports
import DialogCloseButton from '../DialogCloseButton'
import CustomTextField from '@core/components/mui/TextField'
import { useUserData } from '@/contexts/userDataContext';

type AddEditSystemPromptData = {
  roleId?: number
  roleName?: string
  roleContent?: string
  roleContentEng?: string
  user?: string
}

type AddEditSystemPromptProps = {
  open: boolean
  setOpen: (open: boolean) => void
  data?: AddEditSystemPromptData
}

const initialSystemPromptData: AddEditSystemPromptProps['data'] = {
  roleId: 0,
  roleName: '',
  roleContent: '',
  roleContentEng: ''
}

const AddEditSystemPrompt = ({ open, setOpen, data }: AddEditSystemPromptProps) => {
  // States
  const [systempromptData, setSystemPromptData] = useState<AddEditSystemPromptProps['data']>(initialSystemPromptData)
  const { fetchUserData } = useUserData();

  useEffect(() => {
    setSystemPromptData(data ?? initialSystemPromptData)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const apiUrl = process.env.API_URL2
    console.log('API URL:', apiUrl);
    // 轉換data interface
    const transformedData = {
      id: systempromptData?.roleId,
      name: systempromptData?.roleName,
      content: systempromptData?.roleContent,
      user: 'polly'
    }

    try {
      const response = await fetch(`http://192.168.1.196:7001/api/role`, {
        method: data ? 'PUT' : 'POST', // 根據data是否存在決定使用PUT或POST
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transformedData),
      })

      if (!response.ok) {
        throw new Error('Failed to update data')
      }

      // 成功後關閉dialog
      setOpen(false)
      fetchUserData(); // 调用刷新数据的函数
    } catch (error) {
      console.error('Error updating data:', error)
    }
  }

  return (
    <Dialog
      open={open}
      maxWidth='md'
      scroll='body'
      onClose={() => {
        setOpen(false)
      }}
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogTitle variant='h4' className='flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16'>
        {data ? 'Edit System Prompt' : 'Add New System Prompt'}
        {/* <Typography component='span' className='flex flex-col text-center'>
          {data ? 'Edit System Prompt for future billing' : 'Add System Prompt for billing address'}
        </Typography> */}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
      {/* <form onSubmit={e => e.preventDefault()}> */}
        <DialogContent className='pbs-0 sm:pli-16'>
          <DialogCloseButton onClick={() => setOpen(false)} disableRipple>
            <i className='tabler-x' />
          </DialogCloseButton>
          <Grid container spacing={6}>
            <Grid item xs={12} sm={6}>
              <CustomTextField
                fullWidth
                label='System Role Name'
                name='roleName'
                variant='outlined'
                placeholder=''
                value={systempromptData?.roleName}
                onChange={e => setSystemPromptData({ ...systempromptData, roleName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                multiline
                minRows={4}
                maxRows={6}
                label='Role Content'
                name='roleContent'
                variant='outlined'
                placeholder=''
                value={systempromptData?.roleContent}
                onChange={e => setSystemPromptData({ ...systempromptData, roleContent: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                multiline
                minRows={4}
                maxRows={6}
                label='Role Content Eng'
                name='roleContentEng'
                variant='outlined'
                placeholder=''
                value={systempromptData?.roleContentEng}
                onChange={e => setSystemPromptData({ ...systempromptData, roleContentEng: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel control={<Switch defaultChecked />} label='Make this system prompt active' />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions className='justify-center pbs-0 sm:pbe-16 sm:pli-16'>
          <Button variant='contained' type='submit'>{/*  onClick={() => setOpen(false)} */}
            {data ? 'Update' : 'Submit'}
          </Button>
          <Button
            variant='tonal'
            color='secondary'
            onClick={() => {
              setOpen(false)
            }}
            type='reset'
          >
            Cancel
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default AddEditSystemPrompt
