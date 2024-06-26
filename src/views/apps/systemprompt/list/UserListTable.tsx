'use client'

// React Imports
import { useEffect, useState, useMemo } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import type { ButtonProps } from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import { styled } from '@mui/material/styles'
import TablePagination from '@mui/material/TablePagination'
import type { TextFieldProps } from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'

// Third-party Imports
import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'

// Type Imports
import type { RoleType } from '@/types/apps/userTypes'
import type { Locale } from '@configs/i18n'

// Component Imports
import TablePaginationComponent from '@components/TablePaginationComponent'
import CustomTextField from '@core/components/mui/TextField'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Style Imports
import tableStyles from '@core/styles/table.module.css'
import Tooltip from '@mui/material/Tooltip'
import AddEditSystemPrompt from '@components/dialogs/add-edit-systemprompt'
import OpenDialogOnElementClick from '@/components/dialogs/OpenDialogOnElementClick'
import ConfirmationDialog from '@/components/dialogs/confirmation-dialog'
import { Alert, AlertTitle, AlertColor, Fade  } from '@mui/material'; // 引入Alert和AlertTitle
import { useSysRoleData } from '@/contexts/userDataContext'

declare module '@tanstack/table-core' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
  interface FilterMeta {
    itemRank: RankingInfo
  }
}

type RoleTypeWithAction = RoleType & {
  action?: string
}

// Styled Components
const Icon = styled('i')({})

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value)

  // Store the itemRank info
  addMeta({
    itemRank
  })

  // Return if the item should be filtered in/out
  return itemRank.passed
}

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
} & Omit<TextFieldProps, 'onChange'>) => {
  // States
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <CustomTextField {...props} value={value} onChange={e => setValue(e.target.value)} />
}

// Column Definitions
const columnHelper = createColumnHelper<RoleTypeWithAction>()

const UserListTable = ({ tableData }: { tableData?: RoleType[] }) => {
  // States
  const [rowSelection, setRowSelection] = useState({})
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [data, setData] = useState(...[tableData])
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false); // 控制确认对话框的状态
  const [selectedRow, setSelectedRow] = useState<RoleType | null>(null); // 保存选中的行数据
  const [globalFilter, setGlobalFilter] = useState('')
  const { fetchSysRoleData } = useSysRoleData();
  const [alertMessage, setAlertMessage] = useState<string | null>(null); // 用於存儲警告信息
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>('info'); // 用於設置警告類型
  const [openFade, setOpenFade] = useState<boolean>(true) // 用於控制 Fade 動畫
  const [trigger, setTrigger] = useState(false); // 用於強制重新渲染
//'error' | 'warning' | 'info' | 'success'
  // Hooks
  const { lang: locale } = useParams()

  useEffect(() => {
    if(tableData) {
      setData(tableData)
    }
  }, [tableData])

  // 字串截斷函數，處理中英文混合的情況
  const truncateString = (str: string, num: number): string => {
    if (str.length <= num) {
      return str;
    }

  // 初始化變量
  let length = 0;
  let truncated = '';
  const words = str.split(/(\s+)/); // 按照空格和非空格分割

  // 遍歷每個字符，累加長度
  for (let word of words) {
    // 中文字符長度算1，其他字符長度算0.5
    const wordLength = word.split('').reduce((acc, char) => acc + (char.match(/[\u4e00-\u9fff]/) ? 1 : 0.5), 0);

    // 如果累加長度超過指定長度，就截斷
    if (length + wordLength > num) {
      if (length === 0) {
        // 如果第一個單詞就超過長度，則直接截取第一個單詞的一部分
        return word.slice(0, num) + '...';
      }
      truncated += '...';
      break;
    }
    length += wordLength;
    truncated += word;

  }

  return truncated;
  };

  const handleDelete = (row: RoleType) => {
    setSelectedRow(row);
    setOpenConfirmDialog(true);
  };
  const handleConfirmDelete = async () => {
    if (selectedRow) {
      try {
        // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/role`, {
        const response = await fetch(`http://192.168.1.196:7001/api/role/${selectedRow.roleId}`, {
          method: 'DELETE',
        });
        console.log('response:', response);
        if (!response.ok) {
          throw new Error(response.ok + response.statusText);
        }

        // 删除成功后刷新数据
        await fetchSysRoleData();
        setAlertMessage('Data deleted successfully.');
        setAlertSeverity('success');
        setTrigger(!trigger); // 強制重新渲染
        // setData(data?.filter(item => item.roleId !== selectedRow.roleId));
      } catch (error) {
        console.error('Error deleting data:', error);
        setAlertMessage(`Error deleting data: ${error}`);
        setAlertSeverity('error');
        setTrigger(!trigger); // 強制重新渲染
      } finally {
        setOpenConfirmDialog(false);
        setSelectedRow(null);
        setOpenFade(true); // 顯示 Alert
      }
    }
  };
  const columns = useMemo<ColumnDef<RoleTypeWithAction, any>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler()
            }}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler()
            }}
          />
        )
      },
      columnHelper.accessor('roleName', {
        header: 'roleName',
        cell: ({ row }) => (
          <div className='flex items-center gap-4'>
            {/* {getAvatar({ roleName: row.original.roleName })} */}
            <div className='flex flex-col'>
              <Typography color='text.primary' className='font-medium'>
                {row.original.roleName}
              </Typography>
              <Typography variant='body2'>{row.original.roleId}</Typography>
            </div>
          </div>
        )
      }),
      columnHelper.accessor('roleContent', {
        header: 'roleContent',
        cell: ({ row }) => {
          const content = row.original.roleContent;
          const displayContent = truncateString(content, 20);

          return (
            <Tooltip title={content} arrow>
              <Typography className='capitalize' color='text.primary'>
                {displayContent}
              </Typography>
            </Tooltip>
          );
        },
      }),
      columnHelper.accessor('roleContentEng', {
        header: 'roleContentEng',
        cell: ({ row }) => {
          const content = row.original.roleContentEng;
          const displayContent = truncateString(content, 20);

          return (
            <Tooltip title={content} arrow>
              <Typography className='capitalize' color='text.primary'>
                {displayContent}
              </Typography>
            </Tooltip>
          );
        },
      }),
      columnHelper.accessor('action', {
        header: 'Action',
        cell: ({ row }) => (
          <div className='flex items-center'>
            <IconButton>
              <Link href={getLocalizedUrl('apps/systemprompt/view', locale as Locale)} className='flex'>
                <i className='tabler-eye text-[22px] text-textSecondary' />
              </Link>
            </IconButton>
            <OpenDialogOnElementClick
              element={IconButton}
              elementProps={buttonEditProps}
              dialog={AddEditSystemPrompt}
              dialogProps={{ data: row.original, setAlertMessage, setAlertSeverity }}
            >
            </OpenDialogOnElementClick>

            <IconButton onClick={() => handleDelete(row.original)}>
              <i className='tabler-trash text-[22px] text-warning' />
            </IconButton>
          </div>
        ),
        enableSorting: false
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const table = useReactTable({
    data: data as RoleType[],
    columns,
    filterFns: {
      fuzzy: fuzzyFilter
    },
    state: {
      rowSelection,
      globalFilter
    },
    initialState: {
      pagination: {
        pageSize: 10
      }
    },
    enableRowSelection: true, //enable row selection for all rows
    // enableRowSelection: row => row.original.age > 18, // or enable row selection conditionally per row
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues()
  })

  const buttonProps: ButtonProps = {
    variant: 'contained',
    children: 'Add New System Prompt',
    size: 'medium',
    startIcon: <i className='tabler-plus' />
  }

  const buttonEditProps: ButtonProps = {
    variant: 'outlined',
    children: <i className='tabler-edit text-[22px] text-primary' />,
    size: 'small',
  }

  useEffect(() => {
    if (alertMessage && alertSeverity === 'success') {
      setOpenFade(true);
      const timer = setTimeout(() => {
        setOpenFade(false);
      }, 2000); // 2秒自動消失

      return () => clearTimeout(timer); // 清除定時器
    } else if (alertMessage) {
      setOpenFade(true);
    }
  }, [alertMessage, alertSeverity, trigger]);

  const handleAlertClose = () => {
    setOpenFade(false);
    setTimeout(() => {
      setAlertMessage(null);
    }, 300); // 延遲清除消息，確保淡出動畫完成
  };

  const alertContainerStyle = {
    position: 'fixed' as 'fixed',
    // top: '13%',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1000,
  };
  return (
    <>
      <Card>
    {alertMessage && (
    <Fade in={openFade} timeout={{ exit: 300 }}>
            <div style={alertContainerStyle}>
        <Alert severity={alertSeverity} className='mbe-8'
        action={
          <IconButton
            aria-label='close'
            color='inherit'
            size='small'
            onClick={handleAlertClose}
          >
            <i className='tabler-x' />
          </IconButton>
        }>
          <AlertTitle>{alertSeverity === 'success' ? 'Success' : 'Error'}</AlertTitle>
          {alertMessage}
        </Alert>
            </div>
      </Fade>
    )}
        <CardHeader title='System Prompt' className='pbe-4' />
        {/* <TableFilters setData={setData} tableData={tableData} /> */}
        <div className='flex justify-between flex-col items-start md:flex-row md:items-center p-6 border-bs gap-4'>
          <CustomTextField
            select
            value={table.getState().pagination.pageSize}
            onChange={e => table.setPageSize(Number(e.target.value))}
            className='is-[70px]'
          >
            <MenuItem value='10'>10</MenuItem>
            <MenuItem value='25'>25</MenuItem>
            <MenuItem value='50'>50</MenuItem>
          </CustomTextField>
          <div className='flex flex-col sm:flex-row is-full sm:is-auto items-start sm:items-center gap-4'>
            <DebouncedInput
              value={globalFilter ?? ''}
              onChange={value => setGlobalFilter(String(value))}
              placeholder='Search...'
              className='is-full sm:is-auto'
            />
            <Button
              color='secondary'
              variant='tonal'
              startIcon={<i className='tabler-upload' />}
              className='is-full sm:is-auto'
            >
              Export
            </Button>
            <OpenDialogOnElementClick
                element={Button}
                elementProps={buttonProps}
                dialog={AddEditSystemPrompt}
                dialogProps={{ setAlertMessage, setAlertSeverity}}
              />
          </div>
        </div>
        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : (
                        <>
                          <div
                            className={classnames({
                              'flex items-center': header.column.getIsSorted(),
                              'cursor-pointer select-none': header.column.getCanSort()
                            })}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {{
                              asc: <i className='tabler-chevron-up text-xl' />,
                              desc: <i className='tabler-chevron-down text-xl' />
                            }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
                          </div>
                        </>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            {table.getFilteredRowModel().rows.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={table.getVisibleFlatColumns().length} className='text-center'>
                    No data available
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table
                  .getRowModel()
                  .rows.slice(0, table.getState().pagination.pageSize)
                  .map(row => {
                    return (
                      <tr key={row.id} className={classnames({ selected: row.getIsSelected() })}>
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                        ))}
                      </tr>
                    )
                  })}
              </tbody>
            )}
          </table>
        </div>
        <TablePagination
          component={() => <TablePaginationComponent table={table} />}
          count={table.getFilteredRowModel().rows.length}
          rowsPerPage={table.getState().pagination.pageSize}
          page={table.getState().pagination.pageIndex}
          onPageChange={(_, page) => {
            table.setPageIndex(page)
          }}
        />
      </Card>
      <ConfirmationDialog open={openConfirmDialog} setOpen={setOpenConfirmDialog} type='delete'
        onConfirm={handleConfirmDelete} // 添加 onConfirm 回调
        />
    </>
  )
}

export default UserListTable
