'use client'

import React from 'react'
import { ChevronsUpDown, X as RemoveIcon } from 'lucide-react'

import { SIZE_VARIANTS, SIZE_VARIANTS_DEFAULT } from 'ui/src/lib/constants'
import { VariantProps, cva } from 'class-variance-authority'

import { cn, Badge, Checkbox_Shadcn_ as Checkbox } from 'ui'
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from 'ui/src/components/shadcn/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from 'ui/src/components/shadcn/ui/popover'

interface MultiSelectContextProps {
  values: string[]
  onValuesChange: React.Dispatch<React.SetStateAction<string[]>>
  toggleValue: (values: string) => void
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  inputValue: string
  setInputValue: React.Dispatch<React.SetStateAction<string>>
  activeIndex: number
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>
  size?: 'small'
  disabled?: boolean
}

const MultiSelectContext = React.createContext<MultiSelectContextProps | null>(null)

function useMultiSelect() {
  const context = React.useContext(MultiSelectContext)
  if (!context) {
    throw new Error('useMultiSelect must be used within a MultiSelectProvider')
  }
  return context
}

const MultiSelectorVariants = cva('', {
  variants: {
    size: {
      ...SIZE_VARIANTS,
    },
  },
  defaultVariants: {
    size: SIZE_VARIANTS_DEFAULT,
  },
})

type MultiSelectorProps = {
  values: string[]
  onValuesChange: React.Dispatch<React.SetStateAction<string[]>>
  loop?: boolean
  disabled?: boolean
} & React.ComponentPropsWithoutRef<typeof Popover> &
  VariantProps<typeof MultiSelectorVariants>

function MultiSelector({
  values = [],
  onValuesChange,
  disabled,
  children,
  ...props
}: MultiSelectorProps) {
  const [open, setOpen] = React.useState<boolean>(false)
  const [inputValue, setInputValue] = React.useState<string>('')
  const [activeIndex, setActiveIndex] = React.useState<number>(-1)

  const toggleValue = React.useCallback(
    (value: string) => {
      onValuesChange((prevValues: string[]) => {
        const isSelected = prevValues.includes(value)
        if (isSelected) {
          return prevValues.filter((currValue) => currValue !== value)
        } else {
          return [...prevValues, value]
        }
      })
    },
    [onValuesChange]
  )

  return (
    <MultiSelectContext.Provider
      value={{
        values,
        toggleValue,
        onValuesChange,
        open,
        setOpen,
        inputValue,
        setInputValue,
        activeIndex,
        setActiveIndex,
        size: 'small',
        disabled,
      }}
    >
      <Popover open={open} onOpenChange={setOpen} {...props}>
        {children}
      </Popover>
    </MultiSelectContext.Provider>
  )
}

const MultiSelectorTrigger = React.forwardRef<
  HTMLButtonElement,
  {
    label?: string
    persistLabel?: boolean
    className?: string
    badgeLimit?: number | 'auto' | 'wrap'
    deletableBadge?: boolean
    showIcon?: boolean
  } & React.ComponentProps<typeof PopoverTrigger>
>(
  (
    {
      label,
      persistLabel = false,
      className,
      deletableBadge = true,
      badgeLimit = 9999,
      showIcon = true,
      ...props
    },
    ref
  ) => {
    const { values, toggleValue } = useMultiSelect()

    const inputRef = React.useRef<HTMLButtonElement>(null)
    const badgesRef = React.useRef<HTMLDivElement>(null)

    const [visibleBadges, setVisibleBadges] = React.useState<string[]>([])
    const [extraBadgesCount, setExtraBadgesCount] = React.useState(0)
    const [isDeleteHovered, setIsDeleteHovered] = React.useState(false)

    const calculateVisibleBadges = () => {
      if (!inputRef.current || !badgesRef.current) return
      const inputWidth = inputRef.current.offsetWidth
      const badgesContainer = badgesRef.current
      const badges = Array.from(badgesContainer.children) as HTMLElement[]
      let totalWidth = 0
      let visibleCount = 0

      const availableWidth = inputWidth - (showIcon ? 40 : 80)
      for (let i = 0; i < values.length; i++) {
        if (i < badges.length) {
          totalWidth += badges[i].offsetWidth + 8 // 8px for gap
        } else {
          // Estimate width for badges not yet rendered
          totalWidth += 0 // Approximate width of a badge
        }
        if (totalWidth > availableWidth) {
          break
        }
        visibleCount++
      }
      setVisibleBadges(values.slice(0, visibleCount))
      setExtraBadgesCount(Math.max(0, values.length - visibleCount))
    }

    React.useEffect(() => {
      if (!inputRef.current || !badgesRef.current) return

      if (badgeLimit === 'auto') {
        calculateVisibleBadges()
        window.addEventListener('resize', calculateVisibleBadges)
        return () => window.removeEventListener('resize', calculateVisibleBadges)
      } else if (badgeLimit === 'wrap') {
        setVisibleBadges(values)
        setExtraBadgesCount(0)
      } else {
        setVisibleBadges(values.slice(0, badgeLimit))
        setExtraBadgesCount(Math.max(0, values.length - badgeLimit))
      }
    }, [values, badgeLimit])

    const badgeClasses = 'rounded'

    const handleTriggerClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (isDeleteHovered) {
        event.stopPropagation()
        event.preventDefault()
      }
    }

    return (
      <PopoverTrigger asChild ref={ref}>
        <button
          ref={inputRef}
          onClick={handleTriggerClick}
          role="combobox"
          className={cn(
            'flex w-full min-w-[200px] items-center justify-between rounded-md border',
            'border-alternative bg-foreground/[.026] px-3 py-2 text-sm',
            'ring-offset-background placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'hover:border-primary transition-colors duration-200',
            className
          )}
          {...props}
        >
          {values.length === 0 ? (
            <span className="text-foreground-muted leading-[1.375rem]">{label}</span>
          ) : (
            <div
              ref={badgesRef}
              className={cn(
                'flex gap-1 -ml-1 overflow-hidden',
                badgeLimit === 'wrap' && 'flex-wrap',
                badgeLimit !== 'wrap' &&
                  'overflow-x-scroll scrollbar-thin scrollbar-track-transparent transition-colors scrollbar-thumb-muted-foreground dark:scrollbar-thumb-muted scrollbar-thumb-rounded-lg'
              )}
            >
              {visibleBadges.map((value) => (
                <Badge key={value} className={cn('shrink-0', badgeClasses)}>
                  {value}
                  {deletableBadge && (
                    <button
                      onMouseEnter={() => setIsDeleteHovered(true)}
                      onMouseLeave={() => setIsDeleteHovered(false)}
                      onClick={() => {
                        toggleValue(value)
                        setIsDeleteHovered(false)
                      }}
                      className="ml-1 text-foreground-lighter hover:text-foreground-light transition-colors"
                    >
                      <RemoveIcon size={12} />
                    </button>
                  )}
                </Badge>
              ))}
              {extraBadgesCount > 0 && <Badge className={badgeClasses}>+{extraBadgesCount}</Badge>}
              {persistLabel && (
                <span className="text-foreground-muted whitespace-nowrap leading-[1.375rem] ml-1">
                  {label}
                </span>
              )}
            </div>
          )}
          {showIcon && (
            <ChevronsUpDown
              size={16}
              strokeWidth={2}
              className="text-foreground-lighter shrink-0 ml-1.5"
            />
          )}
        </button>
      </PopoverTrigger>
    )
  }
)

MultiSelectorTrigger.displayName = 'MultiSelectorTrigger'

const MultiSelectorInputVariants = cva('bg-control border', {
  variants: {
    size: {
      ...SIZE_VARIANTS,
    },
  },
  defaultVariants: {
    size: SIZE_VARIANTS_DEFAULT,
  },
})

const MultiSelectorInput = React.forwardRef<
  React.ElementRef<typeof CommandInput & { showCloseIcon?: boolean }>,
  React.ComponentPropsWithoutRef<typeof CommandInput>
>(({ className, showCloseIcon, ...props }, ref) => {
  const { setOpen, inputValue, setInputValue, activeIndex, setActiveIndex, size, disabled } =
    useMultiSelect()

  const handleFocus = () => setOpen(true)
  const handleClick = () => setActiveIndex(-1)
  const handleClose = () => setInputValue('')

  return (
    <CommandInput
      {...props}
      ref={ref}
      value={inputValue}
      onValueChange={activeIndex === -1 ? setInputValue : undefined}
      onFocus={handleFocus}
      onClick={handleClick}
      disabled={disabled}
      showCloseIcon={showCloseIcon}
      handleClose={handleClose}
      className={cn(
        MultiSelectorInputVariants({ size }),
        'text-sm bg-transparent border-none outline-none placeholder:text-foreground-muted flex-1',
        className,
        activeIndex !== -1 && 'caret-transparent'
      )}
    />
  )
})

MultiSelectorInput.displayName = 'MultiSelectorInput'

const MultiSelectorContent = React.forwardRef<
  HTMLDivElement,
  React.PropsWithChildren<
    {
      className?: string
    } & React.ComponentProps<typeof PopoverContent>
  >
>(({ children, className, ...props }, ref) => {
  return (
    <PopoverContent ref={ref} className={cn('w-full p-0', className)} {...props}>
      <Command className="">{children}</Command>
    </PopoverContent>
  )
})

MultiSelectorContent.displayName = 'MultiSelectorContent'

const MultiSelectorList = React.forwardRef<
  React.ElementRef<typeof CommandList>,
  React.ComponentPropsWithoutRef<typeof CommandList>
>(({ className, children }, ref) => {
  return (
    <CommandList
      ref={ref}
      className={cn(
        'p-2 flex flex-col gap-2 rounded-md scrollbar-thin scrollbar-track-transparent transition-colors scrollbar-thumb-muted-foreground dark:scrollbar-thumb-muted scrollbar-thumb-rounded-lg w-full',
        'max-h-[300px] overflow-y-auto',
        className
      )}
    >
      {children}
      <CommandEmpty>
        <span className="text-foreground-muted">No results found</span>
      </CommandEmpty>
    </CommandList>
  )
})

MultiSelectorList.displayName = 'MultiSelectorList'

const MultiSelectorItem = React.forwardRef<
  HTMLDivElement,
  { value: string } & React.ComponentPropsWithoutRef<typeof CommandItem>
>(({ className, value, children }, ref) => {
  const id = React.useId()
  const { values: selectedValues, toggleValue, open } = useMultiSelect()
  const isSelected = selectedValues.includes(value)

  return (
    <CommandItem
      ref={ref}
      tabIndex={open ? 0 : -1}
      role="option"
      aria-Value={isSelected}
      onSelect={() => toggleValue(value)}
      className={cn(
        'relative',
        'text-foreground-lighter text-left pointer-events-auto',
        'px-2 py-1.5 rounded',
        'hover:text-foreground hover:!bg-overlay-hover',
        'w-full flex items-center space-x-2',
        'peer-data-[Value=true]:bg-overlay-hover peer-data-[Value=true]:text-strong',
        className
      )}
    >
      <Checkbox
        id={`${id}-checkbox-${value}`}
        checked={isSelected}
        tabIndex={-1}
        className="pointer-events-none"
      />
      <label
        htmlFor={`${id}-checkbox-${value}`}
        className="text-xs flex-grow leading-none pointer-events-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:pointer-events-none peer-disabled:opacity-50"
        tabIndex={-1}
      >
        {children}
      </label>
    </CommandItem>
  )
})

MultiSelectorItem.displayName = 'MultiSelectorItem'

export {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
}
